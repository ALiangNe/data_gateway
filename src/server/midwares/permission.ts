import type { Request, Response, NextFunction } from 'express'
import { errObj } from '../modules/errs'

export const roleCheck = (roles: number[]) =>
    (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user.role)) {
            res.status(403).json(errObj[403])
            return
        }
        next()
    }
