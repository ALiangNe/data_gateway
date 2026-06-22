/**
 * PostgreSQL module
 */
import { Pool, QueryResultRow } from 'pg'
import type { PgCredential } from '../type'
import { POSTGRES_ERRORS } from '../errors/postgres'
/**
 * PostgreSQL client instance
 */
export let pgClient: Pool

/**
 * Initialize PostgreSQL client
 * @param config PostgreSQL configuration
 */
export const initPgClient = async (config: PgCredential) => {
    const { PG_HOST, PG_PORT, PG_USERNAME, PG_PASSWORD, PG_DATABASE, PG_MAX_CONNECTIONS, PG_USE_TLS } = config
    if (!PG_HOST || !PG_PORT || !PG_USERNAME || !PG_PASSWORD || !PG_DATABASE) throw 'INVALID_POSTGRES_CREDENTIALS'

    pgClient = new Pool({
        host: PG_HOST,
        port: PG_PORT,
        user: PG_USERNAME,
        password: PG_PASSWORD,
        database: PG_DATABASE,
        max: PG_MAX_CONNECTIONS,
        connectionTimeoutMillis: 5000,
        ssl: PG_USE_TLS ? { rejectUnauthorized: false } : false,
    })

    try {
        const client = await pgClient.connect()
        client.release()
    } catch (e) {
        console.error('Failed connect PostgreSQL', e)
        throw 'FAILED_CONNECT_PG_CLIENT'
    }
}

/**
 * Disconnect PostgreSQL client
 * @returns 1 on success, 0 if not initialized
 */
export const disconnectPgClient = async (): Promise<number> => {
    if (!pgClient) return 0
    try {
        await pgClient.end()
    } catch (e) {
        console.error('Failed disconnect PostgreSQL client', e)
        throw 'FAILED_DISCONNECT_PG_CLIENT'
    }
    return 1
}

/**
 * Parse postgres error into error message
 */
export const parseError = (error: unknown) => {
    console.error('DB Error:', error)
    if (error instanceof Error && 'code' in error) {
        return POSTGRES_ERRORS[error.code as keyof typeof POSTGRES_ERRORS] || 'UNKNOWN_POSTGRES_ERROR'
    }
    throw 'FAILED_PARSE_ERROR'
}

/**
 * Remote query
 * @param sql query
 * @param remoteSqls remote queries
 * @param values values
 * @returns result of the query
 */
export const remoteQuery = async <T extends QueryResultRow>(sql: string, remoteSqls: string[], values: unknown[]): Promise<T[]> => {
    if (!pgClient) throw 'PG_CLIENT_NOT_READY'

    const res = await pgClient.query<T>(sql, values)
    if (res.rows.length > 0 || remoteSqls.length === 0) return res.rows

    try {
        return await Promise.any(remoteSqls.map(async (remoteSql) => {
            const client = await pgClient.connect()
            try {
                const currentRes = await client.query<T>(remoteSql, values)
                if (currentRes.rows.length === 0) throw new Error('NO_RESULT_FOUND')
                return currentRes.rows
            } finally {
                client.release()
            }
        }))
    } catch (error) {
        if (error instanceof AggregateError) {
            if (error.errors.every(e => e instanceof Error && e.message === 'NO_RESULT_FOUND')) return []
            throw error.errors[0]
        }
        throw error
    }
}
