import { queryBots } from '../../../repositories/bot'
import { queryChatActiveDates, queryChatHistories } from '../../../repositories/chatHistory'
import { queryKnowledge } from '../../../repositories/knowledge'
import { queryMcpCapabilities } from '../../../repositories/mcpCapability'
import { queryMonitorLogs } from '../../../repositories/monitorLog'
import { queryUsers } from '../../../repositories/user'
import { queryUserBehaviorLogs } from '../../../repositories/userBehaviorLog'
import { queryUserMemory } from '../../../repositories/userMemory'
import { getLocationByIp } from '../../../services/maxmind'
import type { Bot, ChatHistory, DataListResult, Knowledge, McpCapability, MonitorLog, User, UserBehaviorLogAggregate, UserBehaviorLogAggregateBy } from '../../../type'

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
 * @param createdAt - createdAt range filter
 * @param page - Page number
 * @param pageSize - Items per page
 * @param order - Sort direction
 * @returns paginated aggregated user behavior log list
 */
export const getUserBehaviorLogs_ = async (
    aggregateBy: UserBehaviorLogAggregateBy,
    userId: string = '',
    createdAt: [string?, string?] | undefined,
    page: number,
    pageSize: number,
    order: 'asc' | 'desc',
): Promise<DataListResult<UserBehaviorLogAggregate>> => {
    let result: DataListResult<UserBehaviorLogAggregate>

    try {
        result = await queryUserBehaviorLogs(
            aggregateBy,
            userId,
            createdAt,
            page,
            pageSize,
            order,
        )
    } catch (error) {
        console.error('get user behavior logs failed: ', error)
        throw error
    }

    const ipSet = new Set<string>()

    for (const row of result.list) {
        for (const item of row.clientIps) {
            ipSet.add(item.value)
        }
    }

    const locationCache = new Map<string, string>()

    for (const ip of ipSet) {
        let label = ip

        const { city, region, country } = getLocationByIp(ip)
        const parts: string[] = []

        if (country) {
            parts.push(country)
        }

        if (region) {
            parts.push(region)
        }

        if (city) {
            parts.push(city)
        }

        if (parts.length > 0) {
            label = parts.join(', ')
        }

        locationCache.set(ip, label)
    }

    const list: UserBehaviorLogAggregate[] = []

    for (const row of result.list) {
        const clientIps = []

        for (const item of row.clientIps) {
            clientIps.push({
                value: locationCache.get(item.value)!,
            })
        }

        list.push({
            ...row,
            clientIps,
        })
    }

    return {
        list,
        total: result.total,
    }
}

/**
 * Get user memory handler.
 * @param userId user id
 * @param soulId soul id
 * @returns memory text
 */
export const getUserMemory_ = async (userId: string, soulId: string): Promise<string> => {
    try {
        return await queryUserMemory(userId, soulId)
    } catch (error) {
        console.error('get user memory failed: ', error)
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
 * Get chat histories handler.
 * @param userId user id
 * @param soulId soul id
 * @param date local date in YYYY-MM-DD format
 * @returns chat history list for the day
 */
export const getChatHistories_ = async (
    userId: string,
    soulId: string,
    date: string,
): Promise<ChatHistory[]> => {
    const startUtc = new Date(`${date}T00:00:00+08:00`).toISOString()

    const end = new Date(`${date}T00:00:00+08:00`)
    end.setDate(end.getDate() + 1)

    const endUtc = end.toISOString()

    try {
        return await queryChatHistories(userId, soulId, startUtc, endUtc)
    } catch (error) {
        console.error('get chat histories failed:', error)
        throw error
    }
}
