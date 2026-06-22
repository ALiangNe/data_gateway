/**
 * User memory repository
 */
import { pgClient, parseError } from '../modules/pg'
import type { DataListResult, UserMemory } from '../type'
import type { QueryResult } from 'pg'

const USER_MEMORY_TABLE = 'user_memories'

const USER_MEMORY_COLUMN_MAP: Record<string, string> = {
    id: 'id',
    memory: 'memory',
    userId: 'user_id',
    soulId: 'soul_id',
    metadata: 'metadata',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
}

const toUserMemory = (row: Record<string, unknown>): UserMemory => {
    return {
        id: row.id as string,
        memory: row.memory as string,
        embedding: row.embedding as number[],
        userId: row.user_id as string,
        soulId: row.soul_id as string,
        metadata: row.metadata as UserMemory['metadata'],
        createdAt: row.created_at as Date,
        updatedAt: row.updated_at as Date,
    }
}

/**
 * Query user memories with pagination and ordering
 * @param filters filter criteria
 * @param page page number
 * @param pageSize items per page
 * @param sortBy sort field
 * @param order sort direction
 * @returns user memory list and total count
 */
export const queryUserMemories = async (
    filters: Record<string, unknown> = {},
    page: number = 1,
    pageSize: number = 20,
    sortBy: string = 'createdAt',
    order: 'asc' | 'desc' = 'desc',
): Promise<DataListResult<UserMemory>> => {
    if (!pgClient) throw 'POSTGRES_NOT_READY'

    if (!Number.isFinite(page) || page < 1) throw 'INVALID_PAGE'
    if (!Number.isFinite(pageSize) || pageSize <= 0) throw 'INVALID_PAGE_SIZE'
    if (order !== 'asc' && order !== 'desc') throw 'INVALID_ORDER'

    const values: unknown[] = []
    const conditions: string[] = []

    for (const [key, value] of Object.entries(filters)) {
        if (value === undefined) continue

        const col = USER_MEMORY_COLUMN_MAP[key]
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

    const orderCol = USER_MEMORY_COLUMN_MAP[sortBy]
    if (!orderCol) throw 'INVALID_SORT_BY'

    const countSql = `SELECT COUNT(*)::int AS total FROM ${USER_MEMORY_TABLE} ${whereClause}`

    values.push(pageSize, (page - 1) * pageSize)
    const sql = `
        SELECT * FROM ${USER_MEMORY_TABLE}
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
        list: res.rows.map((row) => toUserMemory(row)),
        total: countRes.rows[0]?.total as number,
    }
}

/**
 * Query memory fields by user id and soul id
 * @param userId user id
 * @param soulId soul id
 * @returns memory list
 */
export const queryUserMemoriesByUserId = async (userId: string, soulId: string): Promise<string[]> => {
    if (!pgClient) throw 'POSTGRES_NOT_READY'

    const sql = `
        SELECT memory
        FROM ${USER_MEMORY_TABLE}
        WHERE user_id = $1 AND soul_id = $2
        ORDER BY created_at DESC
    `

    let res: QueryResult<{ memory: string }>
    try {
        res = await pgClient.query(sql, [userId, soulId])
    } catch (error) {
        throw parseError(error)
    }

    return res.rows.map((row) => row.memory)
}
