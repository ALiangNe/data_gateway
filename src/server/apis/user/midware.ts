import type { NextFunction, Request, Response } from 'express'
import type { DataListResult, DataRegion, OrderBy, Sort, User, UserBehaviorLogAggregate, UserBehaviorLogAggregateBy, UserBehaviorStatsResult } from '../../../type'
import { errObj } from '../../modules/errs'
import { getUserBehaviorLogs_, getUserBehaviorStats_, getUserMemory_, getUsers_, updateUserPermission_ } from './handler'

/**
 * getUsers middleware.
 */
export const _getUsers = async (req: Request, res: Response, _next: NextFunction) => {
    const region = req.query.region as DataRegion
    const page = req.query.page === undefined ? undefined : Number(req.query.page)
    const pageSize = req.query.pageSize === undefined ? undefined : Number(req.query.pageSize)
    const sortBy = (req.query.sortBy as OrderBy | undefined) ?? 'createdAt'
    const order = (req.query.order as Sort | undefined) ?? 'desc'
    const username = req.query.username as string | undefined
    const email = req.query.email as string | undefined
    const status = req.query.status as User['status'] | undefined
    const role = req.query.role === undefined ? undefined : Number(req.query.role)
    const createdAt = req.query.createdAt as [string?, string?] | undefined
    const updatedAt = req.query.updatedAt as [string?, string?] | undefined

    if (!region) {
        res.status(400).json({ ...errObj[400], errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_REGION' })
        return
    }
    if ((page === undefined) !== (pageSize === undefined)) {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_PARAMETERS' })
        return
    }
    if ((page !== undefined && (isNaN(page) || page < 1)) || (pageSize !== undefined && (isNaN(pageSize) || pageSize < 1 || pageSize > 20))) {
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
    if (role !== undefined && isNaN(role)) {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_PARAMETERS' })
        return
    }

    let result: DataListResult<User> | null = null
    try {
        result = await getUsers_({
            region,
            page,
            pageSize,
            sortBy,
            order,
            username,
            email,
            status,
            role,
            createdAt,
            updatedAt,
        })
    } catch (error) {
        console.error('getUsers failed: ', error)
        res.status(500).json({ ...errObj[500], errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getUserBehaviorLogs middleware.
 */
export const _getUserBehaviorLogs = async (req: Request, res: Response, _next: NextFunction) => {
    const region = req.query.region as DataRegion
    const page = Number(req.query.page)
    const pageSize = Number(req.query.pageSize)
    const order = (req.query.order as Sort | undefined) ?? 'desc'
    const aggregateBy = req.query.aggregateBy as UserBehaviorLogAggregateBy | undefined
    const userId = req.query.userId as string | undefined
    const createdAt = req.query.createdAt as [string?, string?] | undefined

    if (!region || !aggregateBy) {
        res.status(400).json({ ...errObj[400], errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_REGION' })
        return
    }
    if (!['session_id', 'device_id', 'user_id'].includes(aggregateBy)) {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_AGGREGATE_BY' })
        return
    }
    if (isNaN(page) || page < 1 || isNaN(pageSize) || pageSize < 1 || pageSize > 20) {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_PARAMETERS' })
        return
    }
    if (!['asc', 'desc'].includes(order)) {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_ORDER' })
        return
    }

    let result: DataListResult<UserBehaviorLogAggregate> | null = null
    try {
        result = await getUserBehaviorLogs_({
            region,
            page,
            pageSize,
            order,
            aggregateBy,
            userId,
            createdAt,
        })
    } catch (error) {
        console.error('getUserBehaviorLogs failed: ', error)
        res.status(500).json({ ...errObj[500], errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getUserBehaviorStats middleware.
 */
export const _getUserBehaviorStats = async (req: Request, res: Response, _next: NextFunction) => {
    const region = req.query.region as DataRegion
    const createdAt = req.query.createdAt as [string?, string?] | undefined

    if (!region) {
        res.status(400).json({ ...errObj[400], errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_REGION' })
        return
    }

    let result: UserBehaviorStatsResult | null = null
    try {
        result = await getUserBehaviorStats_({
            region,
            createdAt,
        })
    } catch (error) {
        console.error('getUserBehaviorStats failed: ', error)
        res.status(500).json({ ...errObj[500], errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getUserMemory middleware.
 */
export const _getUserMemory = async (req: Request, res: Response, _next: NextFunction) => {
    const region = req.query.region as DataRegion
    const userId = req.query.userId as string | undefined
    const soulId = req.query.soulId as string | undefined

    if (!region || !userId || !soulId) {
        res.status(400).json({ ...errObj[400], errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_REGION' })
        return
    }

    let result: string | null = null
    try {
        result = await getUserMemory_({
            region,
            userId,
            soulId,
        })
    } catch (error) {
        console.error('getUserMemory failed: ', error)
        res.status(500).json({ ...errObj[500], errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * updateUserPermission middleware.
 */
export const _updateUserPermission = async (req: Request, res: Response, _next: NextFunction) => {
    const { region, userId, role } = req.body

    if (!region || !userId || role == null) {
        res.status(400).json({ ...errObj[400], errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_REGION' })
        return
    }
    if (Number(role) < 0 || Number(role) > 9) {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_USER_PERMISSION' })
        return
    }

    try {
        await updateUserPermission_({
            region,
            userId,
            role,
            editedBy: req.user.userId,
        })
    } catch (error) {
        console.error('updateUserPermission failed: ', error)
        if (error instanceof Error && [
            'CANNOT_UPDATE_SELF',
            'USER_NOT_FOUND',
            'FORBIDDEN_UPDATE_PERMISSION',
        ].includes(error.message)) {
            res.status(400).json({ ...errObj[400], errmsg: error.message })
            return
        }
        res.status(500).json({ ...errObj[500], errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200] })
}
