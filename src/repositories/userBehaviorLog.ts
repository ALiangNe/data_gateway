/**
 * User behavior log repository
 */
import { pgClient, parseError } from '../modules/pg'
import type { AggregateConfig, DataListResult, UserBehaviorLogAggregate, UserBehaviorLogAggregateBy, UserBehaviorLogDeviceAggregate, UserBehaviorLogSessionAggregate, UserBehaviorLogUserAggregate, UserBehaviorValue, UserBehaviorValueCount } from '../type'
import type { QueryResult } from 'pg'

const USER_BEHAVIOR_LOG_TABLE = 'user_behavior_logs'

const SHARED_AGGREGATE_FIELDS: AggregateConfig['aggregateFields'] = [
    { key: 'platforms', column: 'platform' },
    { key: 'user_agents', column: 'user_agent' },
    { key: 'screen_sizes', column: 'screen_size' },
    { key: 'languages', column: 'language' },
    { key: 'timezones', column: 'timezone' },
    { key: 'referrers', column: 'referrer' },
    { key: 'utm_sources', column: 'utm_source' },
    { key: 'event_types', column: 'event_type', withCount: true },
    { key: 'event_names', column: 'event_name', withCount: true },
    { key: 'client_ips', column: 'client_ip' },
]

const toUserBehaviorLogSessionAggregate = (row: Record<string, unknown>): UserBehaviorLogSessionAggregate => ({
    sessionId: row.sessionId as string,
    deviceIds: row.deviceIds as UserBehaviorValue[],
    userIds: row.userIds as UserBehaviorValue[],
    platforms: row.platforms as UserBehaviorValue[],
    userAgents: row.userAgents as UserBehaviorValue[],
    screenSizes: row.screenSizes as UserBehaviorValue[],
    languages: row.languages as UserBehaviorValue[],
    timezones: row.timezones as UserBehaviorValue[],
    referrers: row.referrers as UserBehaviorValue[],
    utmSources: row.utmSources as UserBehaviorValue[],
    eventTypes: row.eventTypes as UserBehaviorValueCount[],
    eventNames: row.eventNames as UserBehaviorValueCount[],
    clientIps: row.clientIps as UserBehaviorValue[],
    createdAt: new Date(row.createdAt as string),
})

const toUserBehaviorLogDeviceAggregate = (row: Record<string, unknown>): UserBehaviorLogDeviceAggregate => ({
    deviceId: row.deviceId as string,
    sessionIds: row.sessionIds as UserBehaviorValue[],
    userIds: row.userIds as UserBehaviorValue[],
    platforms: row.platforms as UserBehaviorValue[],
    userAgents: row.userAgents as UserBehaviorValue[],
    screenSizes: row.screenSizes as UserBehaviorValue[],
    languages: row.languages as UserBehaviorValue[],
    timezones: row.timezones as UserBehaviorValue[],
    referrers: row.referrers as UserBehaviorValue[],
    utmSources: row.utmSources as UserBehaviorValue[],
    eventTypes: row.eventTypes as UserBehaviorValueCount[],
    eventNames: row.eventNames as UserBehaviorValueCount[],
    clientIps: row.clientIps as UserBehaviorValue[],
    createdAt: new Date(row.createdAt as string),
})

const toUserBehaviorLogUserAggregate = (row: Record<string, unknown>): UserBehaviorLogUserAggregate => ({
    userId: row.userId as string,
    sessionIds: row.sessionIds as UserBehaviorValue[],
    deviceIds: row.deviceIds as UserBehaviorValue[],
    platforms: row.platforms as UserBehaviorValue[],
    userAgents: row.userAgents as UserBehaviorValue[],
    screenSizes: row.screenSizes as UserBehaviorValue[],
    languages: row.languages as UserBehaviorValue[],
    timezones: row.timezones as UserBehaviorValue[],
    referrers: row.referrers as UserBehaviorValue[],
    utmSources: row.utmSources as UserBehaviorValue[],
    eventTypes: row.eventTypes as UserBehaviorValueCount[],
    eventNames: row.eventNames as UserBehaviorValueCount[],
    clientIps: row.clientIps as UserBehaviorValue[],
    createdAt: new Date(row.createdAt as string),
})

const AGGREGATE_CONFIG: Record<UserBehaviorLogAggregateBy, AggregateConfig> = {
    session_id: {
        groupFields: ['session_id'],
        aggregateFields: [
            { key: 'device_ids', column: 'device_id' },
            { key: 'user_ids', column: 'user_id' },
            ...SHARED_AGGREGATE_FIELDS,
        ],
        mapper: toUserBehaviorLogSessionAggregate,
    },

    device_id: {
        groupFields: ['device_id'],
        aggregateFields: [
            { key: 'session_ids', column: 'session_id' },
            { key: 'user_ids', column: 'user_id' },
            ...SHARED_AGGREGATE_FIELDS,
        ],
        mapper: toUserBehaviorLogDeviceAggregate,
    },

    user_id: {
        groupFields: ['user_id'],
        aggregateFields: [
            { key: 'session_ids', column: 'session_id' },
            { key: 'device_ids', column: 'device_id' },
            ...SHARED_AGGREGATE_FIELDS,
        ],
        mapper: toUserBehaviorLogUserAggregate,
    },
}

/**
 * Query user behavior logs
 * @param aggregateBy aggregation dimension
 * @param userId user_id filter
 * @param createdAt created_at range filter
 * @param page page number
 * @param pageSize page size
 * @param order createdAt order
 * @returns aggregated user behavior logs
 */
export const queryUserBehaviorLogs = async (
    aggregateBy: UserBehaviorLogAggregateBy,
    userId: string = '',
    createdAt: [string?, string?] | undefined,
    page: number = 1,
    pageSize: number = 20,
    order: 'asc' | 'desc' = 'desc',
): Promise<DataListResult<UserBehaviorLogAggregate>> => {
    if (!pgClient) throw 'POSTGRES_NOT_READY'

    const config = AGGREGATE_CONFIG[aggregateBy]
    if (!config) throw 'INVALID_AGGREGATE_BY'
    if (!Number.isFinite(page) || page < 1) throw 'INVALID_PAGE'
    if (!Number.isFinite(pageSize) || pageSize <= 0) throw 'INVALID_PAGE_SIZE'
    if (order !== 'asc' && order !== 'desc') throw 'INVALID_ORDER'

    const { groupFields, aggregateFields, mapper } = config
    const values: unknown[] = []
    const conditions: string[] = []

    if (createdAt) {
        const [start, end] = createdAt

        if (start != null && start !== '') {
            conditions.push(`created_at >= $${values.length + 1}`)
            values.push(start)
        }

        if (end != null && end !== '') {
            conditions.push(`created_at <= $${values.length + 1}`)
            values.push(end)
        }
    }

    if (userId.trim()) {
        conditions.push(`user_id = $${values.length + 1}`)
        values.push(userId)
    }

    const whereClause = conditions.length > 0
        ? `WHERE ${conditions.join(' AND ')}`
        : ''

    const orderSql = order === 'asc' ? 'ASC' : 'DESC'

    const aggregateSelectSql = aggregateFields
        .map(({ key }) => {
            const alias = key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase())
            return `COALESCE(${key}.${key}, '[]'::jsonb) AS "${alias}"`
        })
        .join(', ')

    const aggregateJoinSql = aggregateFields
        .map(({ key }) => {
            const onClause = groupFields
                .map((field) => `${key}.${field} = g.${field}`)
                .join(' AND ')
            return `LEFT JOIN ${key} ON ${onClause}`
        })
        .join(' ')

    const aggregateCtes = aggregateFields
        .map(({ key, column, withCount }) => `
        ${key} AS (
            SELECT
                ${groupFields.join(',')},
                COALESCE(
                    jsonb_agg(
                        jsonb_build_object(
                            ${withCount ? '\'value\', value, \'count\', cnt' : '\'value\', value'}
                        )
                        ORDER BY cnt DESC
                    ),
                    '[]'::jsonb
                ) AS "${key}"
            FROM (
                SELECT
                    ${groupFields.join(',')},
                    ${column} AS value,
                    COUNT(*)::int AS cnt
                FROM filtered_logs
                WHERE
                    ${column} IS NOT NULL
                    AND ${column} <> ''
                GROUP BY
                    ${groupFields.join(',')},
                    ${column}
            ) grouped
            GROUP BY
                ${groupFields.join(',')}
        )`)
        .join(', ')

    const countSql = `
        SELECT COUNT(*)::int AS total
        FROM (
            SELECT
                ${groupFields.join(',')}
            FROM ${USER_BEHAVIOR_LOG_TABLE}
            ${whereClause}
            GROUP BY
                ${groupFields.join(',')}
        ) grouped
    `

    values.push(pageSize, (page - 1) * pageSize)

    const listSql = `
        WITH
        log_group_page AS (
            SELECT
                ${groupFields.join(',')},
                MAX(created_at) AS created_at
            FROM ${USER_BEHAVIOR_LOG_TABLE}
            ${whereClause}
            GROUP BY
                ${groupFields.join(',')}
            ORDER BY
                MAX(created_at) ${orderSql}
            LIMIT $${values.length - 1}
            OFFSET $${values.length}
        ),
        filtered_logs AS (
            SELECT
                l.*
            FROM ${USER_BEHAVIOR_LOG_TABLE} l
            INNER JOIN log_group_page g
                ON ${groupFields.map((field) => `g.${field} = l.${field}`).join(' AND ')}
            ${conditions.length > 0 ? `WHERE ${conditions.map((c) => `l.${c}`).join(' AND ')}` : ''}
        ),
        ${aggregateCtes}

        SELECT
            g.${groupFields[0]} AS "${groupFields[0].replace(/_([a-z])/g, (_, char: string) => char.toUpperCase())}",
            ${aggregateSelectSql},
            g.created_at AS "createdAt"
        FROM log_group_page g
        ${aggregateJoinSql}
        ORDER BY
            g.created_at ${orderSql}
    `

    let countRes: QueryResult<{ total: number }>
    let listRes: QueryResult<Record<string, unknown>>

    try {
        [countRes, listRes] = await Promise.all([
            pgClient.query<{ total: number }>(countSql, values.slice(0, values.length - 2)),
            pgClient.query<Record<string, unknown>>(listSql, values),
        ])
    } catch (error) {
        throw parseError(error)
    }

    return {
        list: listRes.rows.map(mapper),
        total: countRes.rows[0]?.total ?? 0,
    }
}
