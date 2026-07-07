import type { Request, Response, NextFunction } from 'express'
import { errObj } from '../modules/errs'

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error('Error: ', err)
    if (res.headersSent) {
        next(err)
        return
    }
    req.httpTraceError = err
    res.status(500).json(errObj[500])
}
