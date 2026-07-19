import type { NextFunction, Request, Response } from 'express'
import type { ChatHistory, DataRegion } from '../../../type'
import { errObj } from '../../modules/errs'
import { getChatActiveDates_, getChatHistories_ } from './handler'

/**
 * getChatActiveDates middleware.
 */
export const _getChatActiveDates = async (req: Request, res: Response, _next: NextFunction) => {
    const region = req.query.region as DataRegion
    const userId = req.query.userId as string | undefined
    const createdAt = req.query.createdAt as [string?, string?] | undefined

    if (!region || !userId || !createdAt?.[0] || !createdAt?.[1]) {
        res.status(400).json({ errno: 400, errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ errno: 400, errmsg: 'INVALID_REGION' })
        return
    }

    let result: string[] | null = null
    try {
        result = await getChatActiveDates_({
            region,
            userId,
            createdAt: [createdAt[0], createdAt[1]],
        })
    } catch (error) {
        console.error('getChatActiveDates failed: ', error)
        res.status(500).json({ errno: 500, errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getChatHistories middleware.
 */
export const _getChatHistories = async (req: Request, res: Response, _next: NextFunction) => {
    const region = req.query.region as DataRegion
    const userId = req.query.userId as string | undefined
    const soulId = req.query.soulId as string | undefined
    const createdAt = req.query.createdAt as [string?, string?] | undefined

    if (!region || !userId || !soulId || !createdAt?.[0] || !createdAt?.[1]) {
        res.status(400).json({ errno: 400, errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ errno: 400, errmsg: 'INVALID_REGION' })
        return
    }

    let result: ChatHistory[] | null = null
    try {
        result = await getChatHistories_({
            region,
            userId,
            soulId,
            createdAt: [createdAt[0], createdAt[1]],
        })
    } catch (error) {
        console.error('getChatHistories failed: ', error)
        res.status(500).json({ errno: 500, errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200], data: result })
}
