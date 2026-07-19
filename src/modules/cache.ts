/**
 * Redis cache module.
 */
import { createClient, createCluster } from 'redis'
import type { RedisClientType, RedisClusterType } from 'redis'
import type { RedisCredential } from '../type'

export type { RedisClientType }
export let redisClient: RedisClientType | RedisClusterType

/**
 * Initialize Redis connection
 * @param config Redis connection configuration
 * @returns Redis client instance
 */
export const initCache = async (config: RedisCredential) => {
    const { REDIS_HOSTS, REDIS_PORT, REDIS_PASSWORD, REDIS_USE_CLUSTER, REDIS_USE_TLS, onReady, onError, onReconnecting } = config
    if (REDIS_HOSTS.length === 0 || !REDIS_PORT || !REDIS_PASSWORD) throw 'INVALID_REDIS_CREDENTIALS'
    if (!onReady || typeof onReady !== 'function') throw 'MISSING_CALLBACK_ONREADY'
    if (!onError || typeof onError !== 'function') throw 'MISSING_CALLBACK_ONERROR'
    if (!onReconnecting || typeof onReconnecting !== 'function') throw 'MISSING_CALLBACK_ONRECONNECTING'

    const protocol = REDIS_USE_TLS ? 'rediss' : 'redis'
    const socketConfig = {
        tls: REDIS_USE_TLS,
        rejectUnauthorized: false,
        connectTimeout: 5000,
        reconnectStrategy: (retries: number) => Math.min(retries * 100, 3000),
    }

    redisClient = REDIS_USE_CLUSTER
        ? createCluster({
            rootNodes: REDIS_HOSTS.map(host => ({ url: `${protocol}://${host}:${REDIS_PORT}` })),
            defaults: { socket: socketConfig, password: REDIS_PASSWORD },
        })
        : createClient({
            url: `${protocol}://${REDIS_HOSTS[0]}:${REDIS_PORT}`,
            socket: socketConfig,
            password: REDIS_PASSWORD,
        })

    try {
        await redisClient.connect()
    } catch (e) {
        console.error('Error when create redisClient in data_gateway!', e)
        throw 'FAILED_CREATE_REDIS_CLIENT'
    }

    redisClient.on('ready', onReady)
    redisClient.on('error', onError)
    redisClient.on('reconnecting', onReconnecting)

    return redisClient
}

/**
 * Disconnect Redis connection
 * @returns Promise<number> returns 1 on success
 */
export const disconnectCache = async () => {
    console.log('disconnecting redis:cache')
    if (!redisClient) {
        return
    }
    try {
        await redisClient.quit()
    } catch {
        throw 'FAILED_DISCONNECT_CACHE_REDIS'
    }

    console.log('Disconnected from redis:cache! (data_gateway)')
    return 1
}
