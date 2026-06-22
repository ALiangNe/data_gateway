import type { NextFunction, Request, Response } from 'express'
import type { AuthProvider, Bot, ChatHistory, ChatTopic, DataListResult, Knowledge, McpCapability, Media, MonitorLog, User, UserBehaviorLog, UserMemory } from '../../../type'
import { getAuthProviders_, getBots_, getChatHistories_, getChatActiveDates_, getChatHistoriesByDate_, getChatTopics_, getKnowledge_, getMcpCapabilities_, getMedia_, getMonitorLogs_, getUsers_, getUserBehaviorLogs_, getUserMemories_, getUserMemoriesByUserId_ } from './handler'
import { errObj } from '../../modules/errs'

/**
 * getAuthProviders middleware.
 */
export const _getAuthProviders = async (req: Request, res: Response, _next: NextFunction) => {
    const { page, pageSize, sortBy, order, ...filters } = req.body

    let result: DataListResult<AuthProvider> = { list: [], total: 0 }
    try {
        result = await getAuthProviders_(
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('getAuthProviders failed: ', error)
    }

    res.status(200).json({ ...errObj[200], data: result })
}

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
 * getChatHistories middleware.
 */
export const _getChatHistories = async (req: Request, res: Response, _next: NextFunction) => {
    const { page, pageSize, sortBy, order, ...filters } = req.body

    let result: DataListResult<ChatHistory> = { list: [], total: 0 }
    try {
        result = await getChatHistories_(
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('getChatHistories failed: ', error)
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getChatTopics middleware.
 */
export const _getChatTopics = async (req: Request, res: Response, _next: NextFunction) => {
    const { page, pageSize, sortBy, order, ...filters } = req.body

    let result: DataListResult<ChatTopic> = { list: [], total: 0 }
    try {
        result = await getChatTopics_(
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('getChatTopics failed: ', error)
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
 * getMedia middleware.
 */
export const _getMedia = async (req: Request, res: Response, _next: NextFunction) => {
    const { page, pageSize, sortBy, order, ...filters } = req.body

    let result: DataListResult<Media> = { list: [], total: 0 }
    try {
        result = await getMedia_(
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('getMedia failed: ', error)
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
 * getUserMemories middleware.
 */
export const _getUserMemories = async (req: Request, res: Response, _next: NextFunction) => {
    const { page, pageSize, sortBy, order, ...filters } = req.body

    let result: DataListResult<UserMemory> = { list: [], total: 0 }
    try {
        result = await getUserMemories_(
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('getUserMemories failed: ', error)
    }

    res.status(200).json({ ...errObj[200], data: result })
}

/**
 * getUserMemoriesByUserId middleware.
 */
export const _getUserMemoriesByUserId = async (req: Request, res: Response, _next: NextFunction) => {
    const { userId, soulId } = req.body

    let result: string[] = []
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
