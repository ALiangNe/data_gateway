/**
 * User behavior log repository
 */
import { pgClient, parseError } from '../modules/pg'
import type { DataListResult, UserBehaviorLogAggregate, UserBehaviorValueCount } from '../type'
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
        createdAt: row.created_at as Date,
    }
}

const buildAggregateJoin = (
    column: string,
    alias: string,
): string => `
    LEFT JOIN LATERAL (
        SELECT
            COALESCE(
                jsonb_agg(
                    jsonb_build_object(
                        'value', value,
                        'count', cnt
                    )
                    ORDER BY cnt DESC
                ),
                '[]'::jsonb
            ) AS "${alias}"
        FROM (
            SELECT
                ${column} AS value,
                COUNT(*)::int AS cnt
            FROM ${USER_BEHAVIOR_LOG_TABLE}
            WHERE
                session_id = g.session_id
                AND device_id = g.device_id
                AND ${column} IS NOT NULL
                AND ${column} <> ''
            GROUP BY ${column}
        ) grouped
    ) ${alias} ON TRUE
`

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
            conditions.push(
                `created_at >= $${values.length + 1}`,
            )
            values.push(start)
        }

        if (end != null && end !== '') {
            conditions.push(
                `created_at <= $${values.length + 1}`,
            )
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

    const orderSql = order === 'asc'
        ? 'ASC'
        : 'DESC'

    values.push(pageSize, (page - 1) * pageSize)

    const listSql = `
        WITH log_group_page AS (
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
            LIMIT $${values.length - 1} OFFSET $${values.length}
        )
        SELECT
            g.session_id AS "sessionId",
            g.device_id AS "deviceId",
            userIds."userIds" AS "userIds",
            platforms."platforms" AS "platforms",
            userAgents."userAgents" AS "userAgents",
            screenSizes."screenSizes" AS "screenSizes",
            languages."languages" AS "languages",
            timezones."timezones" AS "timezones",
            referrers."referrers" AS "referrers",
            utmSources."utmSources" AS "utmSources",
            eventTypes."eventTypes" AS "eventTypes",
            eventNames."eventNames" AS "eventNames",
            clientIps."clientIps" AS "clientIps",
            g.created_at AS "createdAt"
        FROM log_group_page g
        ${buildAggregateJoin('user_id', 'userIds')}
        ${buildAggregateJoin('platform', 'platforms')}
        ${buildAggregateJoin('user_agent', 'userAgents')}
        ${buildAggregateJoin('screen_size', 'screenSizes')}
        ${buildAggregateJoin('language', 'languages')}
        ${buildAggregateJoin('timezone', 'timezones')}
        ${buildAggregateJoin('referrer', 'referrers')}
        ${buildAggregateJoin('utm_source', 'utmSources')}
        ${buildAggregateJoin('event_type', 'eventTypes')}
        ${buildAggregateJoin('event_name', 'eventNames')}
        ${buildAggregateJoin('client_ip', 'clientIps')}
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
        list: listRes.rows.map((row) => toUserBehaviorLogAggregate(row)),
        total: countRes.rows[0]?.total as number,
    }
}
