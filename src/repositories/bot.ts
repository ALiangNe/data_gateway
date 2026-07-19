/**
 * Bot repository
 */
import { parseError, pgClients } from '../modules/pg'
import type { Bot, DataListResult, DataRegion, OrderBy, Sort } from '../type'
import type { QueryResult } from 'pg'

const BOT_TABLE = 'bots'

const BOT_COLUMN_MAP: Record<string, string> = {
    id: 'id',
    ownerId: 'owner_id',
    model: 'model',
    serialNumber: 'serial_number',
    manufacturer: 'manufacturer',
    status: 'status',
    metadata: 'metadata',
    registeredAt: 'registered_at',
    activatedAt: 'activated_at',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
}

const toBot = (row: Record<string, unknown>): Bot => {
    return {
        id: row.id as string,
        ownerId: row.owner_id as string,
        model: row.model as string,
        serialNumber: row.serial_number as string,
        manufacturer: row.manufacturer as string,
        status: row.status as string,
        metadata: row.metadata as Bot['metadata'],
        registeredAt: row.registered_at as Date | null,
        activatedAt: row.activated_at as Date | null,
        createdAt: row.created_at as Date,
        updatedAt: row.updated_at as Date,
    }
}

/**
 * Query bots with pagination and ordering
 * @param region data region
 * @param page page number
 * @param pageSize items per page
 * @param sortBy sort field
 * @param order sort direction
 * @param model bot model filter
 * @param serialNumber bot serial number filter
 * @param manufacturer bot manufacturer filter
 * @param status bot status filter
 * @returns bot list and total count
 */
export const queryBots = async (
    region: DataRegion,
    page: number,
    pageSize: number,
    sortBy: OrderBy,
    order: Sort,
    model?: string,
    serialNumber?: string,
    manufacturer?: string,
    status?: string,
): Promise<DataListResult<Bot>> => {
    const client = pgClients[region]
    if (!client) throw 'PG_CLIENT_NOT_READY'

    const values: unknown[] = []
    const conditions: string[] = []

    for (const [column, value] of [
        ['model', model],
        ['serial_number', serialNumber],
        ['manufacturer', manufacturer],
        ['status', status],
    ] as const) {
        if (value === undefined) continue
        conditions.push(`${column} = $${values.length + 1}`)
        values.push(value)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const orderCol = BOT_COLUMN_MAP[sortBy]

    const countSql = `SELECT COUNT(*)::int AS total FROM ${BOT_TABLE} ${whereClause}`

    values.push(pageSize, (page - 1) * pageSize)
    const sql = `
        SELECT * FROM ${BOT_TABLE}
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
        items: res.rows.map((row) => toBot(row)),
        total: countRes.rows[0]?.total as number,
    }
}
