/**
 * PostgreSQL module
 */
import { Pool, type PoolClient } from 'pg'
import type { DataRegion, PgCredential } from '../type'
import { POSTGRES_ERRORS } from '../errors/postgres'

export let pgClients: Partial<Record<DataRegion, Pool>> = {}

/**
 * Initialize PostgreSQL clients for data regions
 * @param configs PostgreSQL configurations by region
 */
export const initPgClients = async (configs: Record<DataRegion, PgCredential>) => {
    const usw1Config = configs.usw1
    const euc1Config = configs.euc1
    if (!usw1Config.PG_HOST || !usw1Config.PG_PORT || !usw1Config.PG_USERNAME || !usw1Config.PG_PASSWORD || !usw1Config.PG_DATABASE) throw 'INVALID_POSTGRES_CREDENTIALS'
    if (!euc1Config.PG_HOST || !euc1Config.PG_PORT || !euc1Config.PG_USERNAME || !euc1Config.PG_PASSWORD || !euc1Config.PG_DATABASE) throw 'INVALID_POSTGRES_CREDENTIALS'

    const usw1Client = new Pool({
        host: usw1Config.PG_HOST,
        port: usw1Config.PG_PORT,
        user: usw1Config.PG_USERNAME,
        password: usw1Config.PG_PASSWORD,
        database: usw1Config.PG_DATABASE,
        max: usw1Config.PG_MAX_CONNECTIONS,
        connectionTimeoutMillis: 5000,
        ssl: usw1Config.PG_USE_TLS ? { rejectUnauthorized: false } : false,
    })
    const euc1Client = new Pool({
        host: euc1Config.PG_HOST,
        port: euc1Config.PG_PORT,
        user: euc1Config.PG_USERNAME,
        password: euc1Config.PG_PASSWORD,
        database: euc1Config.PG_DATABASE,
        max: euc1Config.PG_MAX_CONNECTIONS,
        connectionTimeoutMillis: 5000,
        ssl: euc1Config.PG_USE_TLS ? { rejectUnauthorized: false } : false,
    })

    let usw1Connection: PoolClient | null = null
    try {
        usw1Connection = await usw1Client.connect()
    } catch (e) {
        console.error('Failed connect PostgreSQL usw1', e)
        throw 'FAILED_CONNECT_PG_CLIENT'
    }
    if (usw1Connection) usw1Connection.release()

    let euc1Connection: PoolClient | null = null
    try {
        euc1Connection = await euc1Client.connect()
    } catch (e) {
        console.error('Failed connect PostgreSQL euc1', e)
        throw 'FAILED_CONNECT_PG_CLIENT'
    }
    if (euc1Connection) euc1Connection.release()

    pgClients = {
        usw1: usw1Client,
        euc1: euc1Client,
    }
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
