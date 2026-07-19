import type { NextFunction, Request, Response } from 'express'
import type { DataLookupEntity, DataRegion } from '../../../type'
import { errObj } from '../../modules/errs'
import { getDataLookup_ } from './handler'

/**
 * getDataLookup middleware.
 */
export const _getDataLookup = async (req: Request, res: Response, _next: NextFunction) => {
    const region = req.query.region as DataRegion
    const entity = req.query.entity as DataLookupEntity | undefined
    const ids = req.query.ids === undefined
        ? []
        : Array.isArray(req.query.ids)
            ? req.query.ids as string[]
            : [req.query.ids as string]

    if (!region || !entity || !Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ ...errObj[400], errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_REGION' })
        return
    }

    let result: Record<string, unknown>[] | null = null
    try {
        result = await getDataLookup_({
            region,
            entity,
            ids,
        })
    } catch (error) {
        console.error('getDataLookup failed: ', error)
        res.status(500).json({ ...errObj[500], errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200], data: result })
}
