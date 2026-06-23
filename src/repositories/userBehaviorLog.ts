/**
 * User behavior log repository
 */
import { pgClient, parseError } from '../modules/pg'
import type {
    DataListResult,
    UserBehaviorLogAggregate,
    UserBehaviorValueCount,
} from '../type'
import type { QueryResult } from 'pg'

const USER_BEHAVIOR_LOG_TABLE = 'user_behavior_logs'

const toUserBehaviorLogAggregate = (row: Record<string, unknown>): UserBehaviorLogAggregate => {
    return {
        sessionId: row.sessionId as string,
        deviceId: row.deviceId as string,
        userIds: row.userIds as UserBehaviorValueCount[],
        platforms: row.platforms as UserBehaviorValueCount[],
        userAgents: row.userAgents as UserBehaviorValueCount[],
        screenSizes: row.screenSizes as UserBehaviorValueCount[],
        languages: row.languages as UserBehaviorValueCount[],
        timezones: row.timezones as UserBehaviorValueCount[],
        referrers: row.referrers as UserBehaviorValueCount[],
        utmSources: row.utmSources as UserBehaviorValueCount[],
        eventTypes: row.eventTypes as UserBehaviorValueCount[],
        eventNames: row.eventNames as UserBehaviorValueCount[],
        clientIps: row.clientIps as UserBehaviorValueCount[],
        createdAt: row.createdAt as Date,
    }
}

const buildAggregateCte = (
    cteName: string,
    column: string,
): string => `
        ${cteName} AS (
            SELECT
                session_id,
                device_id,
                COALESCE(
                    jsonb_agg(
                        jsonb_build_object(
                            'value', value,
                            'count', cnt
                        )
                        ORDER BY cnt DESC
                    ),
                    '[]'::jsonb
                ) AS "${cteName}"
            FROM (
                SELECT
                    session_id,
                    device_id,
                    ${column} AS value,
                    COUNT(*)::int AS cnt
                FROM filtered_logs
                WHERE
                    ${column} IS NOT NULL
                    AND ${column} <> ''
                GROUP BY
                    session_id,
                    device_id,
                    ${column}
            ) grouped
            GROUP BY
                session_id,
                device_id
        )`

/**
 * Query user behavior logs aggregated by sessionId + deviceId
 * @param createdAt created_at range filter
 * @param page page number
 * @param pageSize page size
 * @param order createdAt order
 * @returns aggregated user behavior logs
 */
export const queryUserBehaviorLogs = async (
    createdAt: [string?, string?] | undefined,
    page: number = 1,
    pageSize: number = 20,
    order: 'asc' | 'desc' = 'desc',
): Promise<DataListResult<UserBehaviorLogAggregate>> => {
    if (!pgClient) throw 'POSTGRES_NOT_READY'

    if (!Number.isFinite(page) || page < 1) throw 'INVALID_PAGE'
    if (!Number.isFinite(pageSize) || pageSize <= 0) throw 'INVALID_PAGE_SIZE'
    if (order !== 'asc' && order !== 'desc') throw 'INVALID_ORDER'

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

    const whereClause = conditions.length > 0
        ? `WHERE ${conditions.join(' AND ')}`
        : ''

    const countSql = `
        SELECT COUNT(*)::int AS total
        FROM (
            SELECT
                session_id,
                device_id
            FROM ${USER_BEHAVIOR_LOG_TABLE}
            ${whereClause}
            GROUP BY
                session_id,
                device_id
        ) grouped
    `

    const orderSql = order === 'asc' ? 'ASC' : 'DESC'

    values.push(pageSize, (page - 1) * pageSize)

    const listSql = `
        WITH
        log_group_page AS (
            SELECT
                session_id,
                device_id,
                MAX(created_at) AS created_at
            FROM ${USER_BEHAVIOR_LOG_TABLE}
            ${whereClause}
            GROUP BY
                session_id,
                device_id
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
                ON g.session_id = l.session_id
                AND g.device_id = l.device_id
        ),
        ${buildAggregateCte('user_ids', 'user_id')},
        ${buildAggregateCte('platforms', 'platform')},
        ${buildAggregateCte('user_agents', 'user_agent')},
        ${buildAggregateCte('screen_sizes', 'screen_size')},
        ${buildAggregateCte('languages', 'language')},
        ${buildAggregateCte('timezones', 'timezone')},
        ${buildAggregateCte('referrers', 'referrer')},
        ${buildAggregateCte('utm_sources', 'utm_source')},
        ${buildAggregateCte('event_types', 'event_type')},
        ${buildAggregateCte('event_names', 'event_name')},
        ${buildAggregateCte('client_ips', 'client_ip')}
        
        SELECT
            g.session_id AS "sessionId",
            g.device_id AS "deviceId",
            COALESCE(user_ids.user_ids, '[]'::jsonb) AS "userIds",
            COALESCE(platforms.platforms, '[]'::jsonb) AS "platforms",
            COALESCE(user_agents.user_agents, '[]'::jsonb) AS "userAgents",
            COALESCE(screen_sizes.screen_sizes, '[]'::jsonb) AS "screenSizes",
            COALESCE(languages.languages, '[]'::jsonb) AS "languages",
            COALESCE(timezones.timezones, '[]'::jsonb) AS "timezones",
            COALESCE(referrers.referrers, '[]'::jsonb) AS "referrers",
            COALESCE(utm_sources.utm_sources, '[]'::jsonb) AS "utmSources",
            COALESCE(event_types.event_types, '[]'::jsonb) AS "eventTypes",
            COALESCE(event_names.event_names, '[]'::jsonb) AS "eventNames",
            COALESCE(client_ips.client_ips, '[]'::jsonb) AS "clientIps",
            g.created_at AS "createdAt"
        FROM log_group_page g
        LEFT JOIN user_ids
            ON user_ids.session_id = g.session_id
            AND user_ids.device_id = g.device_id
        LEFT JOIN platforms
            ON platforms.session_id = g.session_id
            AND platforms.device_id = g.device_id
        LEFT JOIN user_agents
            ON user_agents.session_id = g.session_id
            AND user_agents.device_id = g.device_id
        LEFT JOIN screen_sizes
            ON screen_sizes.session_id = g.session_id
            AND screen_sizes.device_id = g.device_id
        LEFT JOIN languages
            ON languages.session_id = g.session_id
            AND languages.device_id = g.device_id
        LEFT JOIN timezones
            ON timezones.session_id = g.session_id
            AND timezones.device_id = g.device_id
        LEFT JOIN referrers
            ON referrers.session_id = g.session_id
            AND referrers.device_id = g.device_id
        LEFT JOIN utm_sources
            ON utm_sources.session_id = g.session_id
            AND utm_sources.device_id = g.device_id
        LEFT JOIN event_types
            ON event_types.session_id = g.session_id
            AND event_types.device_id = g.device_id
        LEFT JOIN event_names
            ON event_names.session_id = g.session_id
            AND event_names.device_id = g.device_id
        LEFT JOIN client_ips
            ON client_ips.session_id = g.session_id
            AND client_ips.device_id = g.device_id
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
        list: listRes.rows.map(toUserBehaviorLogAggregate),
        total: countRes.rows[0]?.total ?? 0,
    }
}
