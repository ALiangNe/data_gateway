import type { NextFunction, Request, Response } from 'express'
import type { Bot, ChatHistory, DataListResult, Knowledge, McpCapability, MonitorTraceDetail, User } from '../../../type'
import { getBots_, getChatActiveDates_, getChatHistories_, getDataLookup_, getKnowledge_, getMcpCapabilities_, getMonitorLogsTrace_, getUsers_, getUserBehaviorLogs_, getUserMemory_ } from './handler'
import type { UserBehaviorLogAggregate } from '../../../type'
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
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getMonitorLogsTrace middleware.
 */
export const _getMonitorLogsTrace = async (req: Request, res: Response, _next: NextFunction) => {
    const { traceId } = req.body

    let result: MonitorTraceDetail | null = null
    try {
        result = await getMonitorLogsTrace_(traceId)
    } catch (error) {
        console.error('getMonitorLogsTrace failed: ', error)
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
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getUserBehaviorLogs middleware.
 */
export const _getUserBehaviorLogs = async (req: Request, res: Response, _next: NextFunction) => {
    const { aggregateBy, userId, createdAt, page, pageSize, order } = req.body

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
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getUserMemory middleware.
 */
export const _getUserMemory = async (req: Request, res: Response, _next: NextFunction) => {
    const { userId, soulId } = req.body

    let result = ''
    try {
        result = await getUserMemory_(userId, soulId)
    } catch (error) {
        console.error('getUserMemory failed: ', error)
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getChatActiveDates middleware.
 */
export const _getChatActiveDates = async (req: Request, res: Response, _next: NextFunction) => {
    const { userId, currentTime } = req.body

    let result: string[] = []
    try {
        result = await getChatActiveDates_(
            userId,
            currentTime,
        )
    } catch (error) {
        console.error('getChatActiveDates failed: ', error)
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getChatHistories middleware.
 */
export const _getChatHistories = async (req: Request, res: Response, _next: NextFunction) => {
    const { userId, soulId, date } = req.body

    let result: ChatHistory[] = []
    try {
        result = await getChatHistories_(
            userId,
            soulId,
            date,
        )
    } catch (error) {
        console.error('getChatHistories failed: ', error)
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getDataLookup middleware.
 */
export const _getDataLookup = async (req: Request, res: Response, _next: NextFunction) => {
    const { entity, ids } = req.body

    let result: Record<string, unknown>[] = []
    try {
        result = await getDataLookup_(entity, ids)
    } catch (error) {
        console.error('getDataLookup failed: ', error)
    }

    res.status(200).json({ ...errObj[200], data: result })
}
