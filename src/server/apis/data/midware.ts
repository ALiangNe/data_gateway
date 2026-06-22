import type { NextFunction, Request, Response } from 'express'
import type { Bot, ChatHistory, DataListResult, Knowledge, McpCapability, MonitorLog, User, UserBehaviorLog } from '../../../type'
import { getBots_, getChatActiveDates_, getChatHistoriesByDate_, getKnowledge_, getMcpCapabilities_, getMonitorLogs_, getUsers_, getUserBehaviorLogs_, getUserMemoriesByUserId_ } from './handler'
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
 * getMonitorLogs middleware.
 */
export const _getMonitorLogs = async (req: Request, res: Response, _next: NextFunction) => {
    const { page, pageSize, sortBy, order, ...filters } = req.body

    let result: DataListResult<MonitorLog> = { list: [], total: 0 }
    try {
        result = await getMonitorLogs_(
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('getMonitorLogs failed: ', error)
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
    const { page, pageSize, sortBy, order, ...filters } = req.body

    let result: DataListResult<UserBehaviorLog> = { list: [], total: 0 }
    try {
        result = await getUserBehaviorLogs_(
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('getUserBehaviorLogs failed: ', error)
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getUserMemoriesByUserId middleware.
 */
export const _getUserMemoriesByUserId = async (req: Request, res: Response, _next: NextFunction) => {
    const { userId, soulId } = req.body

    let result = ''
    try {
        result = await getUserMemoriesByUserId_(userId, soulId)
    } catch (error) {
        console.error('getUserMemoriesByUserId failed: ', error)
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
 * getChatHistoriesByDate middleware.
 */
export const _getChatHistoriesByDate = async (req: Request, res: Response, _next: NextFunction) => {
    const { userId, soulId, date } = req.body

    let result: ChatHistory[] = []
    try {
        result = await getChatHistoriesByDate_(
            userId,
            soulId,
            date,
        )
    } catch (error) {
        console.error('getChatHistoriesByDate failed: ', error)
    }

    res.status(200).json({ ...errObj[200], data: result })
}
