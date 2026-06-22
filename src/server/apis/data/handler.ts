import { queryAuthProviders } from '../../../repositories/authProvider'
import { queryBots } from '../../../repositories/bot'
import { queryChatHistories, queryChatActiveDates, queryChatHistoriesByDate } from '../../../repositories/chatHistory'
import { queryChatTopics } from '../../../repositories/chatTopic'
import { queryKnowledge } from '../../../repositories/knowledge'
import { queryMcpCapabilities } from '../../../repositories/mcpCapability'
import { queryMedia } from '../../../repositories/media'
import { queryMonitorLogs } from '../../../repositories/monitorLog'
import { queryUsers } from '../../../repositories/user'
import { queryUserBehaviorLogs } from '../../../repositories/userBehavior'
import { queryUserMemories, queryUserMemoriesByUserId } from '../../../repositories/userMemory'
import type { AuthProvider, Bot, ChatHistory, ChatTopic, DataListResult, Knowledge, McpCapability, Media, MonitorLog, User, UserBehaviorLog, UserMemory } from '../../../type'

/**
 * Get auth providers handler.
 * @param filters - Filter criteria.
 * @param page - Page number.
 * @param pageSize - Items per page.
 * @param sortBy - Sort field.
 * @param order - Sort direction: asc or desc.
 * @returns paginated auth provider list
 */
export const getAuthProviders_ = async (
    filters: Record<string, unknown>,
    page: number,
    pageSize: number,
    sortBy: string | undefined,
    order: 'asc' | 'desc',
): Promise<DataListResult<AuthProvider>> => {
    try {
        return await queryAuthProviders(
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('get auth providers failed: ', error)
        throw error
    }
}

/**
 * Get bots handler.
 * @param filters - Filter criteria.
 * @param page - Page number.
 * @param pageSize - Items per page.
 * @param sortBy - Sort field.
 * @param order - Sort direction: asc or desc.
 * @returns paginated bot list
 */
export const getBots_ = async (
    filters: Record<string, unknown>,
    page: number,
    pageSize: number,
    sortBy: string | undefined,
    order: 'asc' | 'desc',
): Promise<DataListResult<Bot>> => {
    try {
        return await queryBots(
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('get bots failed: ', error)
        throw error
    }
}

/**
 * Get chat histories handler.
 * @param filters - Filter criteria.
 * @param page - Page number.
 * @param pageSize - Items per page.
 * @param sortBy - Sort field.
 * @param order - Sort direction: asc or desc.
 * @returns paginated chat history list
 */
export const getChatHistories_ = async (
    filters: Record<string, unknown>,
    page: number,
    pageSize: number,
    sortBy: string | undefined,
    order: 'asc' | 'desc',
): Promise<DataListResult<ChatHistory>> => {
    try {
        return await queryChatHistories(
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('get chat histories failed: ', error)
        throw error
    }
}

/**
 * Get chat topics handler.
 * @param filters - Filter criteria.
 * @param page - Page number.
 * @param pageSize - Items per page.
 * @param sortBy - Sort field.
 * @param order - Sort direction: asc or desc.
 * @returns paginated chat topic list
 */
export const getChatTopics_ = async (
    filters: Record<string, unknown>,
    page: number,
    pageSize: number,
    sortBy: string | undefined,
    order: 'asc' | 'desc',
): Promise<DataListResult<ChatTopic>> => {
    try {
        return await queryChatTopics(
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('get chat topics failed: ', error)
        throw error
    }
}

/**
 * Get knowledge handler.
 * @param filters - Filter criteria.
 * @param page - Page number.
 * @param pageSize - Items per page.
 * @param sortBy - Sort field.
 * @param order - Sort direction: asc or desc.
 * @returns paginated knowledge list
 */
export const getKnowledge_ = async (
    filters: Record<string, unknown>,
    page: number,
    pageSize: number,
    sortBy: string | undefined,
    order: 'asc' | 'desc',
): Promise<DataListResult<Knowledge>> => {
    try {
        return await queryKnowledge(
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('get knowledge failed: ', error)
        throw error
    }
}

/**
 * Get MCP capabilities handler.
 * @param filters - Filter criteria.
 * @param page - Page number.
 * @param pageSize - Items per page.
 * @param sortBy - Sort field.
 * @param order - Sort direction: asc or desc.
 * @returns paginated MCP capability list
 */
export const getMcpCapabilities_ = async (
    filters: Record<string, unknown>,
    page: number,
    pageSize: number,
    sortBy: string | undefined,
    order: 'asc' | 'desc',
): Promise<DataListResult<McpCapability>> => {
    try {
        return await queryMcpCapabilities(
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('get MCP capabilities failed: ', error)
        throw error
    }
}

/**
 * Get media handler.
 * @param filters - Filter criteria.
 * @param page - Page number.
 * @param pageSize - Items per page.
 * @param sortBy - Sort field.
 * @param order - Sort direction: asc or desc.
 * @returns paginated media list
 */
export const getMedia_ = async (
    filters: Record<string, unknown>,
    page: number,
    pageSize: number,
    sortBy: string | undefined,
    order: 'asc' | 'desc',
): Promise<DataListResult<Media>> => {
    try {
        return await queryMedia(
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('get media failed: ', error)
        throw error
    }
}

/**
 * Get monitor logs handler.
 * @param filters - Filter criteria.
 * @param page - Page number.
 * @param pageSize - Items per page.
 * @param sortBy - Sort field.
 * @param order - Sort direction: asc or desc.
 * @returns paginated monitor log list
 */
export const getMonitorLogs_ = async (
    filters: Record<string, unknown>,
    page: number,
    pageSize: number,
    sortBy: string | undefined,
    order: 'asc' | 'desc',
): Promise<DataListResult<MonitorLog>> => {
    try {
        return await queryMonitorLogs(
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('get monitor logs failed: ', error)
        throw error
    }
}

/**
 * Get users handler.
 * @param filters - Filter criteria.
 * @param page - Page number.
 * @param pageSize - Items per page.
 * @param sortBy - Sort field.
 * @param order - Sort direction: asc or desc.
 * @returns paginated user list
 */
export const getUsers_ = async (
    filters: Record<string, unknown>,
    page: number,
    pageSize: number,
    sortBy: string | undefined,
    order: 'asc' | 'desc',
): Promise<DataListResult<User>> => {
    try {
        const { list, total } = await queryUsers(
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
        return {
            list: list.map((row) => ({
                ...row,
                password: row.password ? 'true' : 'false',
            })),
            total,
        }
    } catch (error) {
        console.error('get users failed: ', error)
        throw error
    }
}

/**
 * Get user behavior logs handler.
 * @param filters - Filter criteria.
 * @param page - Page number.
 * @param pageSize - Items per page.
 * @param sortBy - Sort field.
 * @param order - Sort direction: asc or desc.
 * @returns paginated user behavior log list
 */
export const getUserBehaviorLogs_ = async (
    filters: Record<string, unknown>,
    page: number,
    pageSize: number,
    sortBy: string | undefined,
    order: 'asc' | 'desc',
): Promise<DataListResult<UserBehaviorLog>> => {
    try {
        return await queryUserBehaviorLogs(
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('get user behavior logs failed: ', error)
        throw error
    }
}

/**
 * Get user memories handler.
 * @param filters - Filter criteria.
 * @param page - Page number.
 * @param pageSize - Items per page.
 * @param sortBy - Sort field.
 * @param order - Sort direction: asc or desc.
 * @returns paginated user memory list
 */
export const getUserMemories_ = async (
    filters: Record<string, unknown>,
    page: number,
    pageSize: number,
    sortBy: string | undefined,
    order: 'asc' | 'desc',
): Promise<DataListResult<UserMemory>> => {
    try {
        return await queryUserMemories(
            filters,
            page,
            pageSize,
            sortBy,
            order,
        )
    } catch (error) {
        console.error('get user memories failed: ', error)
        throw error
    }
}

/**
 * Get user memories by user id handler.
 * @param userId user id
 * @param soulId soul id
 * @returns memory text
 */
export const getUserMemoriesByUserId_ = async (userId: string, soulId: string): Promise<string> => {
    try {
        return await queryUserMemoriesByUserId(userId, soulId)
    } catch (error) {
        console.error('get user memories by user id failed: ', error)
        throw error
    }
}

/**
 * Get chat active dates handler.
 * @param userId user id
 * @param currentTime current UTC time from frontend
 * @returns distinct local dates in YYYY-MM-DD format
 */
export const getChatActiveDates_ = async (
    userId: string,
    currentTime: string,
): Promise<string[]> => {
    const shanghaiDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date(currentTime))
    const monthStart = `${shanghaiDate.slice(0, 7)}-01`
    const startUtc = new Date(`${monthStart}T00:00:00+08:00`).toISOString()
    const end = new Date(`${monthStart}T00:00:00+08:00`)
    end.setMonth(end.getMonth() + 1)
    const endUtc = end.toISOString()

    try {
        return await queryChatActiveDates(userId, startUtc, endUtc)
    } catch (error) {
        console.error('get chat active dates failed: ', error)
        throw error
    }
}

/**
 * Get chat histories by date handler.
 * @param userId user id
 * @param soulId soul id
 * @param date local date in YYYY-MM-DD format
 * @returns chat history list for the day
 */
export const getChatHistoriesByDate_ = async (
    userId: string,
    soulId: string,
    date: string,
): Promise<ChatHistory[]> => {
    const startUtc = new Date(`${date}T00:00:00+08:00`).toISOString()

    const end = new Date(`${date}T00:00:00+08:00`)
    end.setDate(end.getDate() + 1)

    const endUtc = end.toISOString()

    try {
        return await queryChatHistoriesByDate(userId, soulId, startUtc, endUtc)
    } catch (error) {
        console.error('get chat histories by date failed:', error)
        throw error
    }
}
