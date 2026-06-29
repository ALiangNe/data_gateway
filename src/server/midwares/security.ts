/**
 * Security Related Middleware (DATA_GATEWAY)
 */
import type { Request, Response, NextFunction } from 'express'
import { rateLimiter } from '../modules/limiter'
import { errObj } from '../modules/errs'

/**
 * Request Rate Limiter Check
 */
export const rateLimiteCheck = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.ip) {
        res.status(403).json(errObj[403])
        return
    }

    if (!rateLimiter) {
        next()
        return
    }

    try {
        await rateLimiter.consume(req.ip)
        next()
    } catch {
        res.status(429).send(errObj[429])
        return
    }
}

