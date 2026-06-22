/**
 * User behavior log repository
 */
import { pgClient, parseError } from '../modules/pg'
import type { DataListResult, UserBehaviorLog } from '../type'
import type { QueryResult } from 'pg'

const USER_BEHAVIOR_TABLE = 'user_behavior_logs'

const USER_BEHAVIOR_COLUMN_MAP: Record<string, string> = {
    deviceId: 'device_id',
    sessionId: 'session_id',
    userId: 'user_id',
    platform: 'platform',
    userAgent: 'user_agent',
    screenSize: 'screen_size',
    language: 'language',
    timezone: 'timezone',
    referrer: 'referrer',
    utmSource: 'utm_source',
    eventType: 'event_type',
    eventName: 'event_name',
    clientIp: 'client_ip',
    metadata: 'metadata',
    createdAt: 'created_at',
}

const toUserBehaviorLog = (row: Record<string, unknown>): UserBehaviorLog => {
    return {
        deviceId: row.device_id as string,
        sessionId: row.session_id as string,
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
        metadata: row.metadata as UserBehaviorLog['metadata'],
        createdAt: row.created_at as Date,
    }
}

/**
 * Query user behavior logs with pagination and ordering
 * @param filters filter criteria
 * @param page page number
 * @param pageSize items per page
 * @param sortBy sort field
 * @param order sort direction
 * @returns user behavior log list and total count
 */
export const queryUserBehaviorLogs = async (
    filters: Record<string, unknown> = {},
    page: number = 1,
    pageSize: number = 20,
    sortBy: string = 'createdAt',
    order: 'asc' | 'desc' = 'desc',
): Promise<DataListResult<UserBehaviorLog>> => {
    if (!pgClient) throw 'POSTGRES_NOT_READY'

    if (!Number.isFinite(page) || page < 1) throw 'INVALID_PAGE'
    if (!Number.isFinite(pageSize) || pageSize <= 0) throw 'INVALID_PAGE_SIZE'
    if (order !== 'asc' && order !== 'desc') throw 'INVALID_ORDER'

    const values: unknown[] = []
    const conditions: string[] = []

    for (const [key, value] of Object.entries(filters)) {
        if (value === undefined) continue

        const col = USER_BEHAVIOR_COLUMN_MAP[key]
        if (!col) throw 'INVALID_QUERY_KEYS'

        if (!Array.isArray(value)) {
            conditions.push(`${col} = $${values.length + 1}`)
            values.push(value)
            continue
        }

        const [start, end] = value as [unknown?, unknown?]
        if (start != null && start !== '') {
            conditions.push(`${col} >= $${values.length + 1}`)
            values.push(start)
        }
        if (end != null && end !== '') {
            conditions.push(`${col} <= $${values.length + 1}`)
            values.push(end)
        }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const orderCol = USER_BEHAVIOR_COLUMN_MAP[sortBy]
    if (!orderCol) throw 'INVALID_SORT_BY'

    const countSql = `SELECT COUNT(*)::int AS total FROM ${USER_BEHAVIOR_TABLE} ${whereClause}`

    values.push(pageSize, (page - 1) * pageSize)
    const sql = `
        SELECT * FROM ${USER_BEHAVIOR_TABLE}
        ${whereClause}
        ORDER BY ${orderCol} ${order === 'asc' ? 'ASC' : 'DESC'}
        LIMIT $${values.length - 1} OFFSET $${values.length}
    `

    let countRes: QueryResult<{ total: number }>
    let res: QueryResult<Record<string, unknown>>
    try {
        [countRes, res] = await Promise.all([
            pgClient.query(countSql, values.slice(0, values.length - 2)),
            pgClient.query(sql, values),
        ])
    } catch (error) {
        throw parseError(error)
    }

    return {
        list: res.rows.map((row) => toUserBehaviorLog(row)),
        total: countRes.rows[0]?.total as number,
    }
}
