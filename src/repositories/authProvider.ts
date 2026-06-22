/**
 * Auth provider repository
 */
import { pgClient, parseError } from '../modules/pg'
import type { AuthProvider, DataListResult } from '../type'
import type { QueryResult } from 'pg'

const AUTH_PROVIDER_TABLE = 'auth_providers'

const AUTH_PROVIDER_COLUMN_MAP: Record<string, string> = {
    id: 'id',
    userId: 'user_id',
    provider: 'provider',
    userProviderId: 'user_provider_id',
    email: 'email',
    emailVerified: 'email_verified',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
}

const toAuthProvider = (row: Record<string, unknown>): AuthProvider => {
    return {
        id: row.id as string,
        userId: row.user_id as string,
        provider: row.provider as string,
        userProviderId: row.user_provider_id as string,
        email: row.email as string | null,
        emailVerified: row.email_verified as boolean,
        createdAt: row.created_at as Date,
        updatedAt: row.updated_at as Date,
    }
}

/**
 * Query auth providers with pagination and ordering
 * @param filters filter criteria
 * @param page page number
 * @param pageSize items per page
 * @param sortBy sort field
 * @param order sort direction
 * @returns auth provider list and total count
 */
export const queryAuthProviders = async (
    filters: Record<string, unknown> = {},
    page: number = 1,
    pageSize: number = 20,
    sortBy: string = 'createdAt',
    order: 'asc' | 'desc' = 'desc',
): Promise<DataListResult<AuthProvider>> => {
    if (!pgClient) throw 'POSTGRES_NOT_READY'

    if (!Number.isFinite(page) || page < 1) throw 'INVALID_PAGE'
    if (!Number.isFinite(pageSize) || pageSize <= 0) throw 'INVALID_PAGE_SIZE'
    if (order !== 'asc' && order !== 'desc') throw 'INVALID_ORDER'

    const values: unknown[] = []
    const conditions: string[] = []

    for (const [key, value] of Object.entries(filters)) {
        if (value === undefined) continue

        const col = AUTH_PROVIDER_COLUMN_MAP[key]
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

    const orderCol = AUTH_PROVIDER_COLUMN_MAP[sortBy]
    if (!orderCol) throw 'INVALID_SORT_BY'

    const countSql = `SELECT COUNT(*)::int AS total FROM ${AUTH_PROVIDER_TABLE} ${whereClause}`

    values.push(pageSize, (page - 1) * pageSize)
    const sql = `
        SELECT * FROM ${AUTH_PROVIDER_TABLE}
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
        list: res.rows.map((row) => toAuthProvider(row)),
        total: countRes.rows[0]?.total as number,
    }
}
