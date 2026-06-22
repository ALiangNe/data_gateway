import type { NextFunction, Request, Response } from 'express'
import { errObj } from '../../modules/errs'
import { health_, ready_ } from './handlers'

/**
 * Liveness probe middleware
 */
export const _health = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    let result: string
    try {
        result = await health_()
    } catch (e) {
        console.error('Error when calling health handler: ', e)
        res.status(500).json({ ...errObj[500], message: String(e) })
        return
    }
    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * Readiness probe middleware
 */
export const _ready = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    let result
    try {
        result = await ready_()
    } catch (e) {
        console.error('Error when calling readiness handler: ', e)
        res.status(503).json({ ...errObj[503], message: String(e) })
        return
    }

    if (result.status === 'UP') {
        res.status(200).json({ ...errObj[200], data: result })
        return
    }
    res.status(503).json({ ...errObj[503], data: result })
}
