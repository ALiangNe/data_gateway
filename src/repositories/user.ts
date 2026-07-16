/**
 * User repository
 */
import { parseError, pgClients } from '../modules/pg'
import type { DataListResult, DataRegion, User } from '../type'
import type { QueryResult } from 'pg'

const USER_TABLE = 'users'
const AUTH_PROVIDER_TABLE = 'auth_providers'
const SOUL_TABLE = 'souls'

const USER_COLUMN_MAP: Record<string, string> = {
    id: 'id',
    email: 'email',
    username: 'username',
    password: 'password',
    role: 'role',
    status: 'status',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
}

const toUser = (row: Record<string, unknown>): User => {
    return {
        id: row.id as string,
        soulId: (row.soul_id as string | null) ?? '',
        email: row.email as string,
        username: row.username as string,
        password: row.password as string | null,
        role: row.role as number,
        status: row.status as User['status'],
        providers: (row.providers as string[]) ?? [],
        createdAt: row.created_at as Date,
        updatedAt: row.updated_at as Date,
    }
}

/**
 * Query users with optional pagination and ordering
 * @param filters filter criteria
 * @param page page number
 * @param pageSize items per page
 * @param sortBy sort field
 * @param order sort direction
 * @returns user list and total count
 */
export const queryUsers = async (
    region: DataRegion,
    filters: Record<string, unknown> = {},
    page?: number,
    pageSize?: number,
    sortBy: string = 'createdAt',
    order: 'asc' | 'desc' = 'desc',
): Promise<DataListResult<User>> => {
    const client = pgClients[region]
    if (!client) throw 'PG_CLIENT_NOT_READY'

    const paginated = page != null && pageSize != null
    if (paginated) {
        if (!Number.isFinite(page) || page < 1) throw 'INVALID_PAGE'
        if (!Number.isFinite(pageSize) || pageSize <= 0) throw 'INVALID_PAGE_SIZE'
    }
    if (order !== 'asc' && order !== 'desc') throw 'INVALID_ORDER'

    const values: unknown[] = []
    const conditions: string[] = []

    for (const [key, value] of Object.entries(filters)) {
        if (value === undefined) continue

        const col = USER_COLUMN_MAP[key]
        if (!col) throw 'INVALID_QUERY_KEYS'

        if (!Array.isArray(value)) {
            conditions.push(`u.${col} = $${values.length + 1}`)
            values.push(value)
            continue
        }

        const [start, end] = value as [unknown?, unknown?]
        if (start != null && start !== '') {
            conditions.push(`u.${col} >= $${values.length + 1}`)
            values.push(start)
        }
        if (end != null && end !== '') {
            conditions.push(`u.${col} <= $${values.length + 1}`)
            values.push(end)
        }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const orderCol = USER_COLUMN_MAP[sortBy]
    if (!orderCol) throw 'INVALID_SORT_BY'

    const countSql = `SELECT COUNT(*)::int AS total FROM ${USER_TABLE} u ${whereClause}`

    let sql = `
        SELECT u.*, ap.providers, soul.soul_id
        FROM ${USER_TABLE} u
        LEFT JOIN LATERAL (
            SELECT ARRAY_AGG(ap.provider ORDER BY ap.provider) AS providers
            FROM ${AUTH_PROVIDER_TABLE} ap
            WHERE ap.user_id = u.id
        ) ap ON true
        LEFT JOIN LATERAL (
            SELECT s.id AS soul_id
            FROM ${SOUL_TABLE} s
            WHERE s.user_id = u.id
            ORDER BY s.created_at ASC
            LIMIT 1
        ) soul ON true
        ${whereClause}
        ORDER BY u.${orderCol} ${order === 'asc' ? 'ASC' : 'DESC'}
    `

    const queryValues = [...values]
    if (paginated) {
        queryValues.push(pageSize, (page - 1) * pageSize)
        sql += ` LIMIT $${queryValues.length - 1} OFFSET $${queryValues.length}`
    }

    let countRes: QueryResult<{ total: number }>
    let res: QueryResult<Record<string, unknown>>
    try {
        [countRes, res] = await Promise.all([
            client.query(countSql, values),
            client.query(sql, queryValues),
        ])
    } catch (error) {
        throw parseError(error)
    }

    return {
        list: res.rows.map((row) => toUser(row)),
        total: countRes.rows[0]?.total as number,
    }
}

/**
 * Update user permission
 * @param userId user id
 * @param role new role
 */
export const updateUserPermission = async (
    region: DataRegion,
    userId: string,
    role: number,
): Promise<void> => {
    const client = pgClients[region]
    if (!client) throw 'PG_CLIENT_NOT_READY'

    const sql = `
        UPDATE ${USER_TABLE}
        SET role = $1
        WHERE id = $2
    `

    try {
        await client.query(sql, [role, userId])
    } catch (error) {
        throw parseError(error)
    }
}
