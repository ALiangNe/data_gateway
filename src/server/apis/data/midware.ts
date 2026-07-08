import type { NextFunction, Request, Response } from 'express'
import type { Bot, ChatHistory, DataListResult, Knowledge, McpCapability, MonitorTraceDetail, User } from '../../../type'
import { getBots_, getChatActiveDates_, getChatHistories_, getDataLookup_, getKnowledge_, getMcpCapabilities_, getMonitorLogsTrace_, getUsers_, getUserBehaviorLogs_, getUserBehaviorStats_, getUserMemory_, updateUserPermission_ } from './handler'
import type { UserBehaviorLogAggregate, UserBehaviorStatsResult } from '../../../type'
import { errObj } from '../../modules/errs'

/**
 * getBots middleware.
 */
export const _getBots = async (req: Request, res: Response, _next: NextFunction) => {
    const { page, pageSize, sortBy, order, ...filters } = req.body

    let result: DataListResult<Bot> = { list: [], total: 0 }
    try {
        result = await getBots_(
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('getBots failed: ', error)
        throw error
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getKnowledge middleware.
 */
export const _getKnowledge = async (req: Request, res: Response, _next: NextFunction) => {
    const { page, pageSize, sortBy, order, ...filters } = req.body

    let result: DataListResult<Knowledge> = { list: [], total: 0 }
    try {
        result = await getKnowledge_(
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('getKnowledge failed: ', error)
        throw error
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getMcpCapabilities middleware.
 */
export const _getMcpCapabilities = async (req: Request, res: Response, _next: NextFunction) => {
    const { page, pageSize, sortBy, order, ...filters } = req.body

    let result: DataListResult<McpCapability> = { list: [], total: 0 }
    try {
        result = await getMcpCapabilities_(
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('getMcpCapabilities failed: ', error)
        throw error
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getMonitorLogsTrace middleware.
 */
export const _getMonitorLogsTrace = async (req: Request, res: Response, _next: NextFunction) => {
    const { traceId } = req.body

    if (!traceId) {
        res.status(400).json({ errno: 400, errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }

    let result: MonitorTraceDetail | null = null
    try {
        result = await getMonitorLogsTrace_(traceId)
    } catch (error) {
        console.error('getMonitorLogsTrace failed: ', error)
        throw error
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getUsers middleware.
 */
export const _getUsers = async (req: Request, res: Response, _next: NextFunction) => {
    const { page, pageSize, sortBy, order, ...filters } = req.body

    let result: DataListResult<User> = { list: [], total: 0 }
    try {
        result = await getUsers_(
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('getUsers failed: ', error)
        throw error
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getUserBehaviorLogs middleware.
 */
export const _getUserBehaviorLogs = async (req: Request, res: Response, _next: NextFunction) => {
    const { aggregateBy, userId, createdAt, page, pageSize, order } = req.body

    if (!aggregateBy) {
        res.status(400).json({ errno: 400, errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }

    let result: DataListResult<UserBehaviorLogAggregate> = { list: [], total: 0 }
    try {
        result = await getUserBehaviorLogs_(
            aggregateBy,
            userId,
            createdAt,
            page,
            pageSize,
            order,
        )
    } catch (error) {
        console.error('getUserBehaviorLogs failed: ', error)
        throw error
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getUserBehaviorStats middleware.
 */
export const _getUserBehaviorStats = async (req: Request, res: Response, _next: NextFunction) => {
    const { createdAt } = req.body

    let result: UserBehaviorStatsResult = {
        deviceCount: 0,
        sessionCount: 0,
        sessions: [],
        regions: [],
        mediaClickEvents: [],
    }
    try {
        result = await getUserBehaviorStats_(createdAt)
    } catch (error) {
        console.error('getUserBehaviorStats failed: ', error)
        throw error
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getUserMemory middleware.
 */
export const _getUserMemory = async (req: Request, res: Response, _next: NextFunction) => {
    const { userId, soulId } = req.body

    if (!userId || !soulId) {
        res.status(400).json({ errno: 400, errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }

    let result = ''
    try {
        result = await getUserMemory_(userId, soulId)
    } catch (error) {
        console.error('getUserMemory failed: ', error)
        throw error
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getChatActiveDates middleware.
 */
export const _getChatActiveDates = async (req: Request, res: Response, _next: NextFunction) => {
    const { userId, currentTime } = req.body

    if (!userId || !currentTime) {
        res.status(400).json({ errno: 400, errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }

    let result: string[] = []
    try {
        result = await getChatActiveDates_(
            userId,
            currentTime,
        )
    } catch (error) {
        console.error('getChatActiveDates failed: ', error)
        throw error
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getChatHistories middleware.
 */
export const _getChatHistories = async (req: Request, res: Response, _next: NextFunction) => {
    const { userId, soulId, date } = req.body

    if (!userId || !soulId || !date) {
        res.status(400).json({ errno: 400, errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }

    let result: ChatHistory[] = []
    try {
        result = await getChatHistories_(
            userId,
            soulId,
            date,
        )
    } catch (error) {
        console.error('getChatHistories failed: ', error)
        throw error
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getDataLookup middleware.
 */
export const _getDataLookup = async (req: Request, res: Response, _next: NextFunction) => {
    const { entity, ids } = req.body

    if (!entity || !Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ errno: 400, errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }

    let result: Record<string, unknown>[] = []
    try {
        result = await getDataLookup_(entity, ids)
    } catch (error) {
        console.error('getDataLookup failed: ', error)
        throw error
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * updateUserPermission middleware.
 */
export const _updateUserPermission = async (req: Request, res: Response, _next: NextFunction) => {
    const { userId, role } = req.body

    if (!userId || role == null) {
        res.status(400).json({ errno: 400, errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (Number(role) < 0 || Number(role) > 9) {
        res.status(400).json({ errno: 400, errmsg: 'INVALID_USER_PERMISSION' })
        return
    }

    try {
        await updateUserPermission_(
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
        throw error
    }

    res.status(200).json({ ...errObj[200] })
}
