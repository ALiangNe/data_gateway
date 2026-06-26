/**
 * Monitor log repository
 */
import { pgClient, parseError } from '../modules/pg'
import type { DataListResult, MonitorSpan, MonitorTrace, MonitorTraceDetail } from '../type'
import type { QueryResult } from 'pg'

const MONITOR_LOG_TABLE = 'monitor_logs'

const MONITOR_LOG_COLUMN_MAP: Record<string, string> = {
    service: 'service',
    env: 'env',
    instanceId: 'instance_id',
    traceId: 'trace_id',
    spanId: 'span_id',
    parentSpanId: 'parent_span_id',
    name: 'name',
    status: 'status',
    botId: 'bot_id',
    soulId: 'soul_id',
    meta: 'meta',
    error: 'error',
    startTimeMs: 'start_ms',
    durationMs: 'duration_ms',
}

/**
 * Query monitor logs traces with pagination and ordering
 * @param filters filter criteria
 * @param page page number
 * @param pageSize items per page
 * @param sortBy sort field
 * @param order sort direction
 * @returns monitor trace list and total count
 */
export const queryMonitorLogsTraces = async (
    filters: Record<string, unknown> = {},
    page: number = 1,
    pageSize: number = 20,
    sortBy: string = 'startTimeMs',
    order: 'asc' | 'desc' = 'desc',
): Promise<DataListResult<MonitorTrace>> => {
    if (!pgClient) throw 'POSTGRES_NOT_READY'

    if (!Number.isFinite(page) || page < 1) throw 'INVALID_PAGE'
    if (!Number.isFinite(pageSize) || pageSize <= 0) throw 'INVALID_PAGE_SIZE'
    if (order !== 'asc' && order !== 'desc') throw 'INVALID_ORDER'

    const orderCol = MONITOR_LOG_COLUMN_MAP[sortBy]
    if (!orderCol) throw 'INVALID_SORT_BY'

    const traceIdFilter = filters.traceId || null
    let startTimeStart: unknown = filters.startTimeStart || null
    let startTimeEnd: unknown = filters.startTimeEnd || null

    if (Array.isArray(filters.startTimeMs)) {
        const [start, end] = filters.startTimeMs as [unknown?, unknown?]
        if (start != null && start !== '') startTimeStart = start
        if (end != null && end !== '') startTimeEnd = end
    }

    const groupParams = [traceIdFilter, startTimeStart, startTimeEnd]
    const countSql = `
        SELECT COUNT(*)::int AS total
        FROM (
            SELECT trace_id
            FROM ${MONITOR_LOG_TABLE}
            WHERE ($1::text IS NULL OR trace_id = $1)
            GROUP BY trace_id
            HAVING ($2::bigint IS NULL OR MIN(start_ms) >= $2)
               AND ($3::bigint IS NULL OR MIN(start_ms) <= $3)
        ) grouped
    `

    const pageParams = [...groupParams, pageSize, (page - 1) * pageSize]
    const pageSql = `
        SELECT
            trace_id,
            MIN(start_ms) AS start_time_ms,
            COUNT(*)::int AS service_count,
            (MAX(start_ms + duration_ms) - MIN(start_ms))::bigint AS duration_ms,
            BOOL_OR(status <> 'ok') AS has_error
        FROM ${MONITOR_LOG_TABLE}
        WHERE ($1::text IS NULL OR trace_id = $1)
        GROUP BY trace_id
        HAVING ($2::bigint IS NULL OR MIN(start_ms) >= $2)
           AND ($3::bigint IS NULL OR MIN(start_ms) <= $3)
        ORDER BY MIN(start_ms) ${order === 'asc' ? 'ASC' : 'DESC'}
        LIMIT $4 OFFSET $5
    `

    let countRes: QueryResult<{ total: number }>
    let pageRes: QueryResult<Record<string, unknown>>
    try {
        [countRes, pageRes] = await Promise.all([
            pgClient.query(countSql, groupParams),
            pgClient.query(pageSql, pageParams),
        ])
    } catch (error) {
        throw parseError(error)
    }

    const total = countRes.rows[0]?.total as number
    if (pageRes.rows.length === 0) {
        return { list: [], total }
    }

    const traceIds = pageRes.rows.map((row) => row.trace_id)

    const chainSql = `
        WITH RECURSIVE chain AS (
            SELECT
                trace_id,
                span_id,
                service,
                1 AS depth,
                ARRAY[service]::text[] AS chain
            FROM ${MONITOR_LOG_TABLE}
            WHERE trace_id = ANY($1::text[])
              AND parent_span_id = 'root'

            UNION ALL

            SELECT
                m.trace_id,
                m.span_id,
                m.service,
                c.depth + 1,
                c.chain || m.service
            FROM ${MONITOR_LOG_TABLE} m
            INNER JOIN chain c
                ON m.trace_id = c.trace_id
               AND m.parent_span_id = c.span_id
        )
        SELECT trace_id, chain
        FROM chain c1
        WHERE depth = (
            SELECT MAX(c2.depth) FROM chain c2 WHERE c2.trace_id = c1.trace_id
        )
    `

    let chainRes: QueryResult<{ trace_id: string; chain: string[] }>
    try {
        chainRes = await pgClient.query(chainSql, [traceIds])
    } catch (error) {
        throw parseError(error)
    }

    const chainMap = new Map<string, string[]>()
    for (const row of chainRes.rows) {
        chainMap.set(row.trace_id, row.chain)
    }

    const list: MonitorTrace[] = []
    for (const row of pageRes.rows) {
        list.push({
            traceId: row.trace_id as string,
            startTimeMs: Number(row.start_time_ms),
            chain: chainMap.get(row.trace_id as string) ?? [],
            serviceCount: row.service_count as number,
            durationMs: Number(row.duration_ms),
            status: row.has_error ? 'error' : 'ok',
        })
    }

    return { list, total }
}

/**
 * Query a single monitor logs trace
 * @param traceId trace id
 * @returns monitor trace detail
 */
export const queryMonitorLogsTrace = async (traceId: string): Promise<MonitorTraceDetail | null> => {
    if (!pgClient) throw 'POSTGRES_NOT_READY'

    const spansSql = `
        WITH RECURSIVE ordered AS (
            SELECT
                span_id,
                parent_span_id,
                service,
                env,
                instance_id,
                bot_id,
                soul_id,
                name,
                status,
                start_ms,
                duration_ms,
                error,
                meta,
                1 AS ord
            FROM ${MONITOR_LOG_TABLE}
            WHERE trace_id = $1
              AND parent_span_id = 'root'

            UNION ALL

            SELECT
                m.span_id,
                m.parent_span_id,
                m.service,
                m.env,
                m.instance_id,
                m.bot_id,
                m.soul_id,
                m.name,
                m.status,
                m.start_ms,
                m.duration_ms,
                m.error,
                m.meta,
                o.ord + 1
            FROM ${MONITOR_LOG_TABLE} m
            INNER JOIN ordered o ON m.parent_span_id = o.span_id
            WHERE m.trace_id = $1
        )
        SELECT * FROM ordered ORDER BY ord
    `

    let spansRes: QueryResult<Record<string, unknown>>
    try {
        spansRes = await pgClient.query(spansSql, [traceId])
    } catch (error) {
        throw parseError(error)
    }

    if (spansRes.rows.length === 0) return null

    const spans: MonitorSpan[] = []
    for (const row of spansRes.rows) {
        const span: MonitorSpan = {
            spanId: row.span_id as string,
            parentSpanId: row.parent_span_id as string,
            service: row.service as string,
            env: row.env as string,
            instanceId: String(row.instance_id),
            name: row.name as string,
            status: row.status as string,
            startTimeMs: row.start_ms as number,
            durationMs: row.duration_ms as number,
            error: row.error as MonitorSpan['error'],
            meta: row.meta as MonitorSpan['meta'],
        }
        if (row.bot_id) span.botId = row.bot_id as string
        if (row.soul_id) span.soulId = row.soul_id as string
        spans.push(span)
    }

    return { traceId, spans }
}
