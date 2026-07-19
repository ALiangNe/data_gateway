import type { NextFunction, Request, Response } from 'express'
import type { Bot, DataListResult, DataRegion, OrderBy, Sort } from '../../../type'
import { errObj } from '../../modules/errs'
import { getBots_ } from './handler'

/**
 * getBots middleware.
 */
export const _getBots = async (req: Request, res: Response, _next: NextFunction) => {
    const region = req.query.region as DataRegion
    const page = Number(req.query.page)
    const pageSize = Number(req.query.pageSize)
    const sortBy = (req.query.sortBy as OrderBy | undefined) ?? 'createdAt'
    const order = (req.query.order as Sort | undefined) ?? 'desc'
    const model = req.query.model as string | undefined
    const serialNumber = req.query.serialNumber as string | undefined
    const manufacturer = req.query.manufacturer as string | undefined
    const status = req.query.status as string | undefined

    if (!region) {
        res.status(400).json({ ...errObj[400], errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_REGION' })
        return
    }
    if (isNaN(page) || page < 1 || isNaN(pageSize) || pageSize < 1 || pageSize > 20) {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_PARAMETERS' })
        return
    }
    if (!['registeredAt', 'activatedAt', 'createdAt', 'updatedAt'].includes(sortBy)) {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_SORT_BY' })
        return
    }
    if (!['asc', 'desc'].includes(order)) {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_ORDER' })
        return
    }

    let result: DataListResult<Bot> | null = null
    try {
        result = await getBots_({
            region,
            page,
            pageSize,
            sortBy,
            order,
            model,
            serialNumber,
            manufacturer,
            status,
        })
    } catch (error) {
        console.error('getBots failed: ', error)
        res.status(500).json({ ...errObj[500], errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200], data: result })
}
