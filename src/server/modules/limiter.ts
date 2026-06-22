/**
 * Limiter module For Security Purpose (SERVICE_GATEWAY)
 */
import { RateLimiterRedis } from 'rate-limiter-flexible'
import { redisClient } from '../../modules/cache'

export let rateLimiter: RateLimiterRedis | undefined

export const prepareRateLimiter = () => {
    if (!redisClient) {
        throw new Error('Redis client not initialized, call initCache() first')
    }
    try {
        rateLimiter = new RateLimiterRedis({
            storeClient: redisClient,
            keyPrefix: 'rateLimiter',
            points: 5, // 5 requests
            duration: 1, // per second
        })
    } catch (e) {
        console.error('Error when initialising rate limiter in SERVICE_GATEWAY: ', e)
        throw 'ERROR_INIT_RATE_LIMITER'
    }

    if (!rateLimiter) throw 'FAILED_INIT_RATE_LIMITER'
    return rateLimiter
}

