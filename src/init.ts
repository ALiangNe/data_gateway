import { AUTH_HOST, AUTH_PORT, HTTP_PORT, PG_DATABASE_EUC1, PG_HOST_EUC1, PG_MAX_CONNECTIONS_EUC1, PG_PASSWORD_EUC1, PG_PORT_EUC1, PG_USERNAME_EUC1, PG_USE_TLS_EUC1, PG_DATABASE_USW1, PG_HOST_USW1, PG_MAX_CONNECTIONS_USW1, PG_PASSWORD_USW1, PG_PORT_USW1, PG_USERNAME_USW1, PG_USE_TLS_USW1, REDIS_HOSTS, REDIS_PASSWORD, REDIS_PORT, REDIS_USE_CLUSTER, REDIS_USE_TLS } from './config'
import { prepareKeyPair } from './modules/jwt'
import { startHTTPServer, type Server } from './server'
import { initCache, disconnectCache } from './modules/cache'
import { initPgClients, disconnectPgClient } from './modules/pg'
import { prepareRateLimiter } from './server/modules/limiter'
export { SERVICE_NAME } from './config'
let server: Server | null = null

/**
 * Initialize JWT key material.
 *
 * - If `AUTH_HOST` and `AUTH_PORT` are provided, fetches key pair from remote auth service.
 * - Otherwise, if `KEYPAIR_PATH` is provided, loads key pair from local filesystem.
 * - Throws if neither remote nor local configuration is available.
 *
 * @returns Promise<void>
 * @throws Error when configuration is missing or key loading fails
 */
export const initJwtModules = async () => {
    console.time('prepareKeyPair')
    if (AUTH_HOST && AUTH_PORT) {
        try {
            await prepareKeyPair({ host: AUTH_HOST, port: parseInt(AUTH_PORT, 10) })
        } catch (e) {
            console.error('prepareKeyPair() failed in data_gateway: ', e)
            throw e
        }
    } else {
        throw new Error('Missing AUTH_HOST/AUTH_PORT or KEYPAIR_PATH for JWT key loading')
    }
    console.timeEnd('prepareKeyPair')

    return
}

/**
 * Initialize Redis cache and rate limiter.
 *
 * Side effects:
 * - Prepares Redis-based rate limiter for HTTP protection.
 *
 * @returns Promise<void>
 * @throws Error when Redis connection or rate limiter setup fails
 */
export const initRedisModules = async () => {

    console.time('initialiseRedis')
    try {
        await initCache({
            REDIS_HOSTS,
            REDIS_PORT,
            REDIS_PASSWORD,
            REDIS_USE_CLUSTER,
            REDIS_USE_TLS,
            onReady: () => { console.log('Redis cache ready in data_gateway') },
            onError: (e: unknown) => { console.error('Redis cache error in data_gateway: ', e) },
            onReconnecting: () => { console.log('Redis cache reconnecting in data_gateway') },
        })
    } catch (e) {
        console.error('initCache() ERROR: ', e)
        throw e
    }
    console.timeEnd('initialiseRedis')

    console.time('initialiseRateLimiter')
    try {
        prepareRateLimiter()
    } catch (e) {
        console.error('prepareRateLimiter() ERROR: ', e)
        throw e
    }
    console.timeEnd('initialiseRateLimiter')
}

/**
 * Initialize PostgreSQL data source.
 *
 * Uses PostgreSQL clients configured by region environment variables.
 * Sets `pgClients` on success.
 *
 * @returns Promise<void>
 * @throws Error when configuration is missing or connection fails
 */
export const initPostgresModules = async () => {
    console.time('initialisePostgres')
    try {
        await initPgClients({
            'usw1': {
                PG_HOST: PG_HOST_USW1,
                PG_PORT: PG_PORT_USW1,
                PG_USERNAME: PG_USERNAME_USW1,
                PG_PASSWORD: PG_PASSWORD_USW1,
                PG_DATABASE: PG_DATABASE_USW1,
                PG_MAX_CONNECTIONS: PG_MAX_CONNECTIONS_USW1,
                PG_USE_TLS: PG_USE_TLS_USW1,
            },
            'euc1': {
                PG_HOST: PG_HOST_EUC1,
                PG_PORT: PG_PORT_EUC1,
                PG_USERNAME: PG_USERNAME_EUC1,
                PG_PASSWORD: PG_PASSWORD_EUC1,
                PG_DATABASE: PG_DATABASE_EUC1,
                PG_MAX_CONNECTIONS: PG_MAX_CONNECTIONS_EUC1,
                PG_USE_TLS: PG_USE_TLS_EUC1,
            },
        })

    } catch (e) {
        console.error('initPgClients() ERROR: ', e)
        throw e
    }
    console.timeEnd('initialisePostgres')
}
/**
 * Start HTTP server.
 *
 * Uses `HTTP_PORT` from configuration and returns the underlying Node `Server` instance.
 *
 * @returns Server HTTP server instance
 */
export const initHTTPServer = () => {
    console.time('http server')
    server = startHTTPServer(HTTP_PORT as number) as Server
    console.timeEnd('http server')
    return server
}

/**
 * Gracefully stop PostgreSQL modules.
 *
 * Closes the PostgreSQL client if it has been initialized.
 */
export const stopPostgresModules = async () => {
    try {
        await disconnectPgClient()
    } catch (e) {
        console.error('Error when disconnecting PostgreSQL: ', e)
    }
}

export const stopHTTPServer = async () => {
    if (!server) {
        return
    }
    server.close()
    server = null
}

/**
 * Gracefully stop Redis modules (cache, msglist listener, messenger).
 *
 * Closes:
 * - Redis Pub/Sub messenger
 * - Redis cache client
 * - Redis msglist listener
 *
* @returns Promise<void>
 */
export const stopRedisModules = async () => {
    console.time('stopRedis')
    try {
        await disconnectCache()
    } catch (e) {
        console.error('Error when disconnecting Cache: ', e)
    }
    console.timeEnd('stopRedis')
}
