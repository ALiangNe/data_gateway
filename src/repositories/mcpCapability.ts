/**
 * MCP capability repository
 */
import { parseError, pgClients } from '../modules/pg'
import type { DataListResult, DataRegion, McpCapability, OrderBy, Sort } from '../type'
import type { QueryResult } from 'pg'

const MCP_CAPABILITY_TABLE = 'mcp_capabilities'

const MCP_CAPABILITY_COLUMN_MAP: Record<string, string> = {
    id: 'id',
    document: 'document',
    metadata: 'metadata',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
}

const toMcpCapability = (row: Record<string, unknown>): McpCapability => {
    return {
        id: row.id as string,
        document: row.document as string,
        embedding: row.embedding as number[],
        metadata: row.metadata as McpCapability['metadata'],
        createdAt: row.created_at as Date,
        updatedAt: row.updated_at as Date,
    }
}

/**
 * Query MCP capabilities with pagination and ordering
 * @param filters filter criteria
 * @param page page number
 * @param pageSize items per page
 * @param sortBy sort field
 * @param order sort direction
 * @returns MCP capability list and total count
 */
export const queryMcpCapabilities = async (
    region: DataRegion,
    page: number,
    pageSize: number,
    sortBy: OrderBy,
    order: Sort,
    document?: string,
): Promise<DataListResult<McpCapability>> => {
    const client = pgClients[region]
    if (!client) throw 'PG_CLIENT_NOT_READY'

    const values: unknown[] = []
    const conditions: string[] = []

    if (document !== undefined) {
        conditions.push(`document ILIKE $${values.length + 1}`)
        values.push(`%${document}%`)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const orderCol = MCP_CAPABILITY_COLUMN_MAP[sortBy]

    const countSql = `SELECT COUNT(*)::int AS total FROM ${MCP_CAPABILITY_TABLE} ${whereClause}`

    values.push(pageSize, (page - 1) * pageSize)
    const sql = `
        SELECT * FROM ${MCP_CAPABILITY_TABLE}
        ${whereClause}
        ORDER BY ${orderCol} ${order === 'asc' ? 'ASC' : 'DESC'}
        LIMIT $${values.length - 1} OFFSET $${values.length}
    `

    let countRes: QueryResult<{ total: number }>
    let res: QueryResult<Record<string, unknown>>
    try {
        [countRes, res] = await Promise.all([
            client.query(countSql, values.slice(0, values.length - 2)),
            client.query(sql, values),
        ])
    } catch (error) {
        throw parseError(error)
    }

    return {
        items: res.rows.map((row) => toMcpCapability(row)),
        total: countRes.rows[0]?.total as number,
    }
}
