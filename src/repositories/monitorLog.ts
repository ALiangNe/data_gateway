/**
 * Monitor log repository
 */
import { pgClient, parseError } from '../modules/pg'
import type { MonitorSpan, MonitorTraceDetail } from '../type'
import type { QueryResult } from 'pg'

const MONITOR_LOG_TABLE = 'monitor_logs'

/**
 * Query a single monitor logs trace
 * @param traceId trace id
 * @returns monitor trace detail
 */
export const queryMonitorLogsTrace = async (traceId: string): Promise<MonitorTraceDetail | null> => {
    if (!pgClient) throw 'POSTGRES_NOT_READY'

    const spansSql = `
        SELECT
            span_id,
            parent_span_id,
            env,
            service,
            instance_id,
            event_name,
            status,
            start_ms,
            duration_ms,
            error,
            trace_attributes,
            metadata
        FROM ${MONITOR_LOG_TABLE}
        WHERE trace_id = $1
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
            parentSpanId: row.parent_span_id as string | null,
            env: row.env as string,
            service: row.service as string,
            instanceId: String(row.instance_id),
            eventName: row.event_name as string,
            status: row.status as string,
            startTimeMs: Number(row.start_ms),
            durationMs: Number(row.duration_ms),
            error: row.error as MonitorSpan['error'],
            traceAttributes: row.trace_attributes as MonitorSpan['traceAttributes'],
            metadata: row.metadata as MonitorSpan['metadata'],
        }
        spans.push(span)
    }

    return { traceId, spans }
}
