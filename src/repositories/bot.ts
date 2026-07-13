/**
 * Bot repository
 */
import { pgClient, parseError } from '../modules/pg'
import type { Bot, DataListResult } from '../type'
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
 * @param filters filter criteria
 * @param page page number
 * @param pageSize items per page
 * @param sortBy sort field
 * @param order sort direction
 * @returns bot list and total count
 */
export const queryBots = async (
    filters: Record<string, unknown> = {},
    page: number = 1,
    pageSize: number = 20,
    sortBy: string = 'createdAt',
    order: 'asc' | 'desc' = 'desc',
): Promise<DataListResult<Bot>> => {
    if (!pgClient) throw 'POSTGRES_NOT_READY'

    if (!Number.isFinite(page) || page < 1) throw 'INVALID_PAGE'
    if (!Number.isFinite(pageSize) || pageSize <= 0) throw 'INVALID_PAGE_SIZE'
    if (order !== 'asc' && order !== 'desc') throw 'INVALID_ORDER'

    const values: unknown[] = []
    const conditions: string[] = []

    for (const [key, value] of Object.entries(filters)) {
        if (value === undefined) continue

        const col = BOT_COLUMN_MAP[key]
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

    const orderCol = BOT_COLUMN_MAP[sortBy]
    if (!orderCol) throw 'INVALID_SORT_BY'

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
            pgClient.query(countSql, values.slice(0, values.length - 2)),
            pgClient.query(sql, values),
        ])
    } catch (error) {
        throw parseError(error)
    }

    return {
        list: res.rows.map((row) => toBot(row)),
        total: countRes.rows[0]?.total as number,
    }
}
