/**
 * User repository
 */
import { parseError, pgClients } from '../modules/pg'
import type { DataListResult, DataRegion, OrderBy, Sort, User } from '../type'
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
    page: number | undefined,
    pageSize: number | undefined,
    sortBy: OrderBy,
    order: Sort,
    username?: string,
    email?: string,
    status?: User['status'],
    role?: number,
    createdAt?: [string?, string?],
    updatedAt?: [string?, string?],
): Promise<DataListResult<User>> => {
    const client = pgClients[region]
    if (!client) throw 'PG_CLIENT_NOT_READY'

    const paginated = page != null && pageSize != null
    const values: unknown[] = []
    const conditions: string[] = []

    for (const [column, value] of [
        ['u.username', username],
        ['u.email', email],
        ['u.status', status],
        ['u.role', role],
    ] as const) {
        if (value === undefined) continue
        conditions.push(`${column} = $${values.length + 1}`)
        values.push(value)
    }

    for (const [column, range] of [
        ['u.created_at', createdAt],
        ['u.updated_at', updatedAt],
    ] as const) {
        if (range?.[0]) {
            conditions.push(`${column} >= $${values.length + 1}`)
            values.push(range[0])
        }
        if (range?.[1]) {
            conditions.push(`${column} <= $${values.length + 1}`)
            values.push(range[1])
        }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const orderCol = USER_COLUMN_MAP[sortBy]

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
        items: res.rows.map((row) => toUser(row)),
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
