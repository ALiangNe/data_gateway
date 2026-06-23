/**
 * User behavior log repository
 */
import { pgClient, parseError } from '../modules/pg'
import type { DataListResult } from '../type'
import type { QueryResult } from 'pg'

export interface UserBehaviorValueCount {
    value: string
    count: number
}

export interface UserBehaviorSessionAggregate {
    sessionId: string
    deviceId: string
    userIds: UserBehaviorValueCount[]
    platforms: UserBehaviorValueCount[]
    userAgents: UserBehaviorValueCount[]
    screenSizes: UserBehaviorValueCount[]
    languages: UserBehaviorValueCount[]
    timezones: UserBehaviorValueCount[]
    referrers: UserBehaviorValueCount[]
    utmSources: UserBehaviorValueCount[]
    eventTypes: UserBehaviorValueCount[]
    eventNames: UserBehaviorValueCount[]
    clientIps: UserBehaviorValueCount[]
    createdAt: Date
}

const USER_BEHAVIOR_TABLE = 'user_behavior_logs'

type UserBehaviorEventRow = {
    sessionId: string
    deviceId: string
    userId: string | null
    platform: string
    userAgent: string
    screenSize: string | null
    language: string | null
    timezone: string | null
    referrer: string | null
    utmSource: string | null
    eventType: string
    eventName: string
    clientIp: string | null
}

type SessionSummaryRow = {
    session_id: string
    device_id: string
    started_at: Date
    ended_at: Date
}

const sessionKey = (sessionId: string, deviceId: string) => `${sessionId}::${deviceId}`

const toEventRow = (row: Record<string, unknown>): UserBehaviorEventRow => ({
    sessionId: row.session_id as string,
    deviceId: row.device_id as string,
    userId: row.user_id as string | null,
    platform: row.platform as string,
    userAgent: row.user_agent as string,
    screenSize: row.screen_size as string | null,
    language: row.language as string | null,
    timezone: row.timezone as string | null,
    referrer: row.referrer as string | null,
    utmSource: row.utm_source as string | null,
    eventType: row.event_type as string,
    eventName: row.event_name as string,
    clientIp: row.client_ip as string | null,
})

const aggregateValueCount = (
    rows: UserBehaviorEventRow[],
    field: keyof Omit<UserBehaviorEventRow, 'sessionId' | 'deviceId'>,
): UserBehaviorValueCount[] => {
    const counts = new Map<string, number>()

    for (const row of rows) {
        const value = row[field]
        if (value == null || value === '') continue
        const key = String(value)
        counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    return [...counts.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
}

const toSessionAggregate = (
    summary: SessionSummaryRow,
    rows: UserBehaviorEventRow[],
): UserBehaviorSessionAggregate => ({
    sessionId: summary.session_id,
    deviceId: summary.device_id,
    userIds: aggregateValueCount(rows, 'userId'),
    platforms: aggregateValueCount(rows, 'platform'),
    userAgents: aggregateValueCount(rows, 'userAgent'),
    screenSizes: aggregateValueCount(rows, 'screenSize'),
    languages: aggregateValueCount(rows, 'language'),
    timezones: aggregateValueCount(rows, 'timezone'),
    referrers: aggregateValueCount(rows, 'referrer'),
    utmSources: aggregateValueCount(rows, 'utmSource'),
    eventTypes: aggregateValueCount(rows, 'eventType'),
    eventNames: aggregateValueCount(rows, 'eventName'),
    clientIps: aggregateValueCount(rows, 'clientIp'),
    createdAt: summary.ended_at,
})

/**
 * Query user behavior sessions aggregated by sessionId + deviceId
 * @param createdAt createdAt range filter
 * @param page page number
 * @param pageSize items per page
 * @param order sort direction
 * @returns aggregated session list and total session count
 */
export const queryUserBehaviorSessions = async (
    createdAt: [string?, string?] | undefined,
    page: number = 1,
    pageSize: number = 20,
    order: 'asc' | 'desc' = 'desc',
): Promise<DataListResult<UserBehaviorSessionAggregate>> => {
    if (!pgClient) throw 'POSTGRES_NOT_READY'

    if (!Number.isFinite(page) || page < 1) throw 'INVALID_PAGE'
    if (!Number.isFinite(pageSize) || pageSize <= 0) throw 'INVALID_PAGE_SIZE'
    if (order !== 'asc' && order !== 'desc') throw 'INVALID_ORDER'

    const filterValues: unknown[] = []
    const conditions: string[] = []

    if (createdAt) {
        const [start, end] = createdAt
        if (start != null && start !== '') {
            conditions.push(`created_at >= $${filterValues.length + 1}`)
            filterValues.push(start)
        }
        if (end != null && end !== '') {
            conditions.push(`created_at <= $${filterValues.length + 1}`)
            filterValues.push(end)
        }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const countSql = `
        SELECT COUNT(*)::int AS total
        FROM (
            SELECT 1
            FROM ${USER_BEHAVIOR_TABLE}
            ${whereClause}
            GROUP BY session_id, device_id
        ) grouped
    `

    const sessionValues = [...filterValues, pageSize, (page - 1) * pageSize]
    const sessionSql = `
        SELECT
            session_id,
            device_id,
            COUNT(*)::int AS event_count,
            MIN(created_at) AS started_at,
            MAX(created_at) AS ended_at
        FROM ${USER_BEHAVIOR_TABLE}
        ${whereClause}
        GROUP BY session_id, device_id
        ORDER BY ended_at ${order === 'asc' ? 'ASC' : 'DESC'}
        LIMIT $${filterValues.length + 1} OFFSET $${filterValues.length + 2}
    `

    let countRes: QueryResult<{ total: number }>
    let sessionRes: QueryResult<SessionSummaryRow>
    try {
        [countRes, sessionRes] = await Promise.all([
            pgClient.query(countSql, filterValues),
            pgClient.query(sessionSql, sessionValues),
        ])
    } catch (error) {
        throw parseError(error)
    }

    const total = countRes.rows[0]?.total ?? 0
    const sessions = sessionRes.rows

    if (sessions.length === 0) {
        return { list: [], total }
    }

    const pairPlaceholders = sessions.map((_, index) => {
        const base = index * 2 + 1
        return `($${base}, $${base + 1})`
    }).join(', ')
    const pairValues = sessions.flatMap((session) => [session.session_id, session.device_id])

    const logsSql = `
        SELECT *
        FROM ${USER_BEHAVIOR_TABLE}
        WHERE (session_id, device_id) IN (${pairPlaceholders})
    `

    let logsRes: QueryResult<Record<string, unknown>>
    try {
        logsRes = await pgClient.query(logsSql, pairValues)
    } catch (error) {
        throw parseError(error)
    }

    const logsBySession = new Map<string, UserBehaviorEventRow[]>()
    for (const row of logsRes.rows) {
        const event = toEventRow(row)
        const key = sessionKey(event.sessionId, event.deviceId)
        const bucket = logsBySession.get(key)
        if (bucket) bucket.push(event)
        else logsBySession.set(key, [event])
    }

    return {
        list: sessions.map((summary) => toSessionAggregate(
            summary,
            logsBySession.get(sessionKey(summary.session_id, summary.device_id)) ?? [],
        )),
        total,
    }
}
