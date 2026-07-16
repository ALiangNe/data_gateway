import type { NextFunction, Request, Response } from 'express'
import type { Bot, ChatHistory, DataListResult, DataRegion, Knowledge, McpCapability, MonitorTraceDetail, User } from '../../../type'
import { getBots_, getChatActiveDates_, getChatHistories_, getDataLookup_, getKnowledge_, getMcpCapabilities_, getMonitorLogsTrace_, getUsers_, getUserBehaviorLogs_, getUserBehaviorStats_, getUserMemory_, updateUserPermission_ } from './handler'
import type { UserBehaviorLogAggregate, UserBehaviorStatsResult } from '../../../type'
import { errObj } from '../../modules/errs'

/**
 * getBots middleware.
 */
export const _getBots = async (req: Request, res: Response, _next: NextFunction) => {
    const { region, page, pageSize, sortBy, order, ...filters } = req.body
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ errno: 400, errmsg: 'INVALID_REGION' })
        return
    }

    let result: DataListResult<Bot> = { list: [], total: 0 }
    try {
        result = await getBots_(
            region,
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('getBots failed: ', error)
        res.status(500).json({ errno: 500, errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getKnowledge middleware.
 */
export const _getKnowledge = async (req: Request, res: Response, _next: NextFunction) => {
    const { region, page, pageSize, sortBy, order, ...filters } = req.body
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ errno: 400, errmsg: 'INVALID_REGION' })
        return
    }

    let result: DataListResult<Knowledge> = { list: [], total: 0 }
    try {
        result = await getKnowledge_(
            region,
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('getKnowledge failed: ', error)
        res.status(500).json({ errno: 500, errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getMcpCapabilities middleware.
 */
export const _getMcpCapabilities = async (req: Request, res: Response, _next: NextFunction) => {
    const { region, page, pageSize, sortBy, order, ...filters } = req.body
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ errno: 400, errmsg: 'INVALID_REGION' })
        return
    }

    let result: DataListResult<McpCapability> = { list: [], total: 0 }
    try {
        result = await getMcpCapabilities_(
            region,
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('getMcpCapabilities failed: ', error)
        res.status(500).json({ errno: 500, errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getMonitorLogsTrace middleware.
 */
export const _getMonitorLogsTrace = async (req: Request, res: Response, _next: NextFunction) => {
    const { region, traceId } = req.body

    if (!traceId || !region) {
        res.status(400).json({ errno: 400, errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ errno: 400, errmsg: 'INVALID_REGION' })
        return
    }

    let result: MonitorTraceDetail | null = null
    try {
        result = await getMonitorLogsTrace_(region, traceId)
    } catch (error) {
        console.error('getMonitorLogsTrace failed: ', error)
        res.status(500).json({ errno: 500, errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getUsers middleware.
 */
export const _getUsers = async (req: Request, res: Response, _next: NextFunction) => {
    const { region, page, pageSize, sortBy, order, ...filters } = req.body
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ errno: 400, errmsg: 'INVALID_REGION' })
        return
    }

    let result: DataListResult<User> = { list: [], total: 0 }
    try {
        result = await getUsers_(
            region,
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('getUsers failed: ', error)
        res.status(500).json({ errno: 500, errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getUserBehaviorLogs middleware.
 */
export const _getUserBehaviorLogs = async (req: Request, res: Response, _next: NextFunction) => {
    const { region, aggregateBy, userId, createdAt, page, pageSize, order } = req.body

    if (!region || !aggregateBy) {
        res.status(400).json({ errno: 400, errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ errno: 400, errmsg: 'INVALID_REGION' })
        return
    }
    if (!['session_id', 'device_id', 'user_id'].includes(aggregateBy)) {
        res.status(400).json({ errno: 400, errmsg: 'INVALID_AGGREGATE_BY' })
        return
    }

    let result: DataListResult<UserBehaviorLogAggregate> = { list: [], total: 0 }
    try {
        result = await getUserBehaviorLogs_(
            region,
            aggregateBy,
            userId,
            createdAt,
            page,
            pageSize,
            order,
        )
    } catch (error) {
        console.error('getUserBehaviorLogs failed: ', error)
        res.status(500).json({ errno: 500, errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getUserBehaviorStats middleware.
 */
export const _getUserBehaviorStats = async (req: Request, res: Response, _next: NextFunction) => {
    const { region, createdAt } = req.body
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ errno: 400, errmsg: 'INVALID_REGION' })
        return
    }

    let result: UserBehaviorStatsResult = {
        deviceCount: 0,
        sessionCount: 0,
        sessions: [],
        regions: [],
        mediaClickEvents: [],
    }
    try {
        result = await getUserBehaviorStats_(region, createdAt)
    } catch (error) {
        console.error('getUserBehaviorStats failed: ', error)
        res.status(500).json({ errno: 500, errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getUserMemory middleware.
 */
export const _getUserMemory = async (req: Request, res: Response, _next: NextFunction) => {
    const { region, userId, soulId } = req.body

    if (!region || !userId || !soulId) {
        res.status(400).json({ errno: 400, errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ errno: 400, errmsg: 'INVALID_REGION' })
        return
    }

    let result = ''
    try {
        result = await getUserMemory_(region, userId, soulId)
    } catch (error) {
        console.error('getUserMemory failed: ', error)
        res.status(500).json({ errno: 500, errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getChatActiveDates middleware.
 */
export const _getChatActiveDates = async (req: Request, res: Response, _next: NextFunction) => {
    const { region, userId, currentTime } = req.body

    if (!region || !userId || !currentTime) {
        res.status(400).json({ errno: 400, errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ errno: 400, errmsg: 'INVALID_REGION' })
        return
    }

    let result: string[] = []
    try {
        result = await getChatActiveDates_(
            region,
            userId,
            currentTime,
        )
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
    const { region, userId, soulId, date } = req.body

    if (!region || !userId || !soulId || !date) {
        res.status(400).json({ errno: 400, errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ errno: 400, errmsg: 'INVALID_REGION' })
        return
    }

    let result: ChatHistory[] = []
    try {
        result = await getChatHistories_(
            region,
            userId,
            soulId,
            date,
        )
    } catch (error) {
        console.error('getChatHistories failed: ', error)
        res.status(500).json({ errno: 500, errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getDataLookup middleware.
 */
export const _getDataLookup = async (req: Request, res: Response, _next: NextFunction) => {
    const { region, entity, ids } = req.body

    if (!region || !entity || !Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ errno: 400, errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ errno: 400, errmsg: 'INVALID_REGION' })
        return
    }

    let result: Record<string, unknown>[] = []
    try {
        result = await getDataLookup_(region, entity, ids)
    } catch (error) {
        console.error('getDataLookup failed: ', error)
        res.status(500).json({ errno: 500, errmsg: String(error) })
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
        res.status(400).json({ errno: 400, errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ errno: 400, errmsg: 'INVALID_REGION' })
        return
    }
    if (Number(role) < 0 || Number(role) > 9) {
        res.status(400).json({ errno: 400, errmsg: 'INVALID_USER_PERMISSION' })
        return
    }

    try {
        await updateUserPermission_(
            region as DataRegion,
            userId,
            role,
            req.user.userId,
        )
    } catch (error) {
        console.error('updateUserPermission failed: ', error)
        if (error instanceof Error && [
            'CANNOT_UPDATE_SELF',
            'USER_NOT_FOUND',
            'FORBIDDEN_UPDATE_PERMISSION',
        ].includes(error.message)) {
            res.status(400).json({ errno: 400, errmsg: error.message })
            return
        }
        res.status(500).json({ errno: 500, errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200] })
}
