/**
 * Monitor log repository
 */
import { pgClient, parseError } from '../modules/pg'
import type { DataListResult, MonitorLog } from '../type'
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

const toMonitorLog = (row: Record<string, unknown>): MonitorLog => {
    return {
        service: row.service as string,
        env: row.env as string,
        instanceId: row.instance_id as number,
        traceId: row.trace_id as string,
        spanId: row.span_id as string,
        parentSpanId: row.parent_span_id as string | null,
        name: row.name as string,
        startTimeMs: row.start_ms as number,
        durationMs: row.duration_ms as number,
        status: row.status as string,
        botId: row.bot_id as string | null,
        soulId: row.soul_id as string | null,
        meta: row.meta as MonitorLog['meta'],
        error: row.error as MonitorLog['error'],
    }
}

/**
 * Query monitor logs with pagination and ordering
 * @param filters filter criteria
 * @param page page number
 * @param pageSize items per page
 * @param sortBy sort field
 * @param order sort direction
 * @returns monitor log list and total count
 */
export const queryMonitorLogs = async (
    filters: Record<string, unknown> = {},
    page: number = 1,
    pageSize: number = 20,
    sortBy: string = 'startTimeMs',
    order: 'asc' | 'desc' = 'desc',
): Promise<DataListResult<MonitorLog>> => {
    if (!pgClient) throw 'POSTGRES_NOT_READY'

    if (!Number.isFinite(page) || page < 1) throw 'INVALID_PAGE'
    if (!Number.isFinite(pageSize) || pageSize <= 0) throw 'INVALID_PAGE_SIZE'
    if (order !== 'asc' && order !== 'desc') throw 'INVALID_ORDER'

    const values: unknown[] = []
    const conditions: string[] = []

    for (const [key, value] of Object.entries(filters)) {
        if (value === undefined) continue

        const col = MONITOR_LOG_COLUMN_MAP[key]
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

    const orderCol = MONITOR_LOG_COLUMN_MAP[sortBy]
    if (!orderCol) throw 'INVALID_SORT_BY'

    const countSql = `SELECT COUNT(*)::int AS total FROM ${MONITOR_LOG_TABLE} ${whereClause}`

    values.push(pageSize, (page - 1) * pageSize)
    const sql = `
        SELECT * FROM ${MONITOR_LOG_TABLE}
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
        list: res.rows.map((row) => toMonitorLog(row)),
        total: countRes.rows[0]?.total as number,
    }
}
