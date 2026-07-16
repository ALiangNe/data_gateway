/**
 * PostgreSQL module
 */
import { Pool, type PoolClient } from 'pg'
import type { DataRegion, PgCredential } from '../type'
import { POSTGRES_ERRORS } from '../errors/postgres'

export let pgClients: Partial<Record<DataRegion, Pool>> = {}

/**
 * Initialize PostgreSQL clients
 * @param configs PostgreSQL configurations
 */
export const initPgClients = async (configs: Record<DataRegion, PgCredential>) => {
    const clients: Partial<Record<DataRegion, Pool>> = {}
    for (const [region, config] of Object.entries(configs) as [DataRegion, PgCredential][]) {
        const { PG_HOST, PG_PORT, PG_USERNAME, PG_PASSWORD, PG_DATABASE, PG_MAX_CONNECTIONS, PG_USE_TLS } = config
        if (!PG_HOST || !PG_PORT || !PG_USERNAME || !PG_PASSWORD || !PG_DATABASE) throw 'INVALID_POSTGRES_CREDENTIALS'

        const client = new Pool({
            host: PG_HOST,
            port: PG_PORT,
            user: PG_USERNAME,
            password: PG_PASSWORD,
            database: PG_DATABASE,
            max: PG_MAX_CONNECTIONS,
            connectionTimeoutMillis: 5000,
            ssl: PG_USE_TLS ? { rejectUnauthorized: false } : false,
        })

        let connection: PoolClient | null = null
        try {
            connection = await client.connect()
        } catch (e) {
            console.error(`Failed connect PostgreSQL ${region}`, e)
            throw 'FAILED_CONNECT_PG_CLIENT'
        }
        if (connection) connection.release()

        clients[region] = client
    }
    pgClients = clients
}

/**
 * Disconnect PostgreSQL client
 * @returns 1 on success, 0 if not initialized
 */
export const disconnectPgClient = async (): Promise<number> => {
    const clients = Object.values(pgClients)
    if (clients.length === 0) return 0
    try {
        await Promise.all(clients.map((client) => client.end()))
    } catch (e) {
        console.error('Failed disconnect PostgreSQL client', e)
        throw 'FAILED_DISCONNECT_PG_CLIENT'
    }
    pgClients = {}
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
