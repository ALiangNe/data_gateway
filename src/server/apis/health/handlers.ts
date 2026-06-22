import { redisClient } from '../../../modules/cache'
import { pgClient } from '../../../modules/pg'
import type { ReadinessResult } from '../../../type'

/**
 * Liveness probe handler: server is alive.
 */
export const health_ = async (): Promise<string> => {
    return 'OK'
}

/**
 * Readiness probe handler: verify critical dependencies.
 */
export const ready_ = async (): Promise<ReadinessResult> => {
    const result: ReadinessResult = {
        status: 'UP',
        checks: {
            redis: 'DOWN',
            pg: 'DOWN',
        },
    }

    try {
        if (!redisClient || !redisClient.isOpen) throw new Error('REDIS_NOT_READY')
        // await redisClient.ping()
        result.checks.redis = 'UP'
    } catch {
        result.checks.redis = 'DOWN'
        result.status = 'DOWN'
    }

    try {
        if (!pgClient) throw new Error('PG_NOT_READY')
        await pgClient.query('SELECT 1')
        result.checks.pg = 'UP'
    } catch {
        result.checks.pg = 'DOWN'
        result.status = 'DOWN'
    }

    return result
}
