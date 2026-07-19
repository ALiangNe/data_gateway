import type { NextFunction, Request, Response } from 'express'
import type { DataListResult, DataRegion, Knowledge, McpCapability, OrderBy, Sort } from '../../../type'
import { errObj } from '../../modules/errs'
import { getKnowledge_, getMcpCapabilities_ } from './handler'

/**
 * getKnowledge middleware.
 */
export const _getKnowledge = async (req: Request, res: Response, _next: NextFunction) => {
    const region = req.query.region as DataRegion
    const page = Number(req.query.page)
    const pageSize = Number(req.query.pageSize)
    const sortBy = (req.query.sortBy as OrderBy | undefined) ?? 'createdAt'
    const order = (req.query.order as Sort | undefined) ?? 'desc'
    const document = req.query.document as string | undefined

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
    if (!['createdAt', 'updatedAt'].includes(sortBy)) {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_SORT_BY' })
        return
    }
    if (!['asc', 'desc'].includes(order)) {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_ORDER' })
        return
    }

    let result: DataListResult<Knowledge> | null = null
    try {
        result = await getKnowledge_({
            region,
            page,
            pageSize,
            sortBy,
            order,
            document,
        })
    } catch (error) {
        console.error('getKnowledge failed: ', error)
        res.status(500).json({ ...errObj[500], errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getMcpCapabilities middleware.
 */
export const _getMcpCapabilities = async (req: Request, res: Response, _next: NextFunction) => {
    const region = req.query.region as DataRegion
    const page = Number(req.query.page)
    const pageSize = Number(req.query.pageSize)
    const sortBy = (req.query.sortBy as OrderBy | undefined) ?? 'createdAt'
    const order = (req.query.order as Sort | undefined) ?? 'desc'
    const document = req.query.document as string | undefined

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
    if (!['createdAt', 'updatedAt'].includes(sortBy)) {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_SORT_BY' })
        return
    }
    if (!['asc', 'desc'].includes(order)) {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_ORDER' })
        return
    }

    let result: DataListResult<McpCapability> | null = null
    try {
        result = await getMcpCapabilities_({
            region,
            page,
            pageSize,
            sortBy,
            order,
            document,
        })
    } catch (error) {
        console.error('getMcpCapabilities failed: ', error)
        res.status(500).json({ ...errObj[500], errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200], data: result })
}
