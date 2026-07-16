import { queryBots } from '../../../repositories/bot'
import { queryChatActiveDates, queryChatHistories } from '../../../repositories/chatHistory'
import { lookupData } from '../../../repositories/dataLookup'
import { queryKnowledge } from '../../../repositories/knowledge'
import { queryMcpCapabilities } from '../../../repositories/mcpCapability'
import { queryMonitorLogsTrace } from '../../../repositories/monitorLog'
import { queryUsers, updateUserPermission } from '../../../repositories/user'
import { queryUserBehaviorLogs, queryUserBehaviorStats } from '../../../repositories/userBehaviorLog'
import { queryUserMemory } from '../../../repositories/userMemory'
import { getLocationByIp } from '../../../services/maxmind'
import type { Bot, ChatHistory, DataListResult, DataLookupEntity, DataRegion, Knowledge, McpCapability, MonitorTraceDetail, User, UserBehaviorLogAggregate, UserBehaviorLogAggregateBy, UserBehaviorStatsQueryResult, UserBehaviorStatsResult } from '../../../type'

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
    region: DataRegion,
    filters: Record<string, unknown>,
    page: number,
    pageSize: number,
    sortBy: string | undefined,
    order: 'asc' | 'desc',
): Promise<DataListResult<Bot>> => {
    try {
        return await queryBots(
            region,
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
    region: DataRegion,
    filters: Record<string, unknown>,
    page: number,
    pageSize: number,
    sortBy: string | undefined,
    order: 'asc' | 'desc',
): Promise<DataListResult<Knowledge>> => {
    try {
        return await queryKnowledge(
            region,
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
    region: DataRegion,
    filters: Record<string, unknown>,
    page: number,
    pageSize: number,
    sortBy: string | undefined,
    order: 'asc' | 'desc',
): Promise<DataListResult<McpCapability>> => {
    try {
        return await queryMcpCapabilities(
            region,
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
 * Get monitor logs trace handler.
 * @param traceId - trace id
 * @returns monitor trace detail
 */
export const getMonitorLogsTrace_ = async (region: DataRegion, traceId: string): Promise<MonitorTraceDetail | null> => {
    try {
        return await queryMonitorLogsTrace(region, traceId)
    } catch (error) {
        console.error('get monitor logs trace failed: ', error)
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
    region: DataRegion,
    filters: Record<string, unknown>,
    page: number | undefined,
    pageSize: number | undefined,
    sortBy: string | undefined,
    order: 'asc' | 'desc',
): Promise<DataListResult<User>> => {
    try {
        const { list, total } = await queryUsers(
            region,
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
    region: DataRegion,
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
            region,
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
 * Get user behavior stats handler.
 * @param createdAt - createdAt range filter
 * @returns user behavior stats
 */
export const getUserBehaviorStats_ = async (
    region: DataRegion,
    createdAt: [string?, string?] | undefined,
): Promise<UserBehaviorStatsResult> => {
    let result: UserBehaviorStatsQueryResult

    try {
        result = await queryUserBehaviorStats(region, createdAt)
    } catch (error) {
        console.error('get user behavior stats failed: ', error)
        throw error
    }

    const regions = new Map<string, number>()

    for (const clientIp of result.clientIps) {
        const { country } = getLocationByIp(clientIp)
        const regionKey = country ?? 'Unknown'
        regions.set(regionKey, (regions.get(regionKey) ?? 0) + 1)
    }

    const regionList = [...regions.entries()]
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count)

    return {
        deviceCount: result.deviceCount,
        sessionCount: result.sessionCount,
        sessions: result.sessions.map((session) => ({
            deviceId: session.deviceId,
            createdAt: session.createdAt.toISOString(),
        })),
        regions: regionList,
        mediaClickEvents: result.mediaClickEvents,
    }
}

/**
 * Get user memory handler.
 * @param userId user id
 * @param soulId soul id
 * @returns memory text
 */
export const getUserMemory_ = async (region: DataRegion, userId: string, soulId: string): Promise<string> => {
    try {
        return await queryUserMemory(region, userId, soulId)
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
    region: DataRegion,
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
        return await queryChatActiveDates(region, userId, startUtc, endUtc)
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
    region: DataRegion,
    userId: string,
    soulId: string,
    date: string,
): Promise<ChatHistory[]> => {
    const startUtc = new Date(`${date}T00:00:00+08:00`).toISOString()

    const end = new Date(`${date}T00:00:00+08:00`)
    end.setDate(end.getDate() + 1)

    const endUtc = end.toISOString()

    try {
        return await queryChatHistories(region, userId, soulId, startUtc, endUtc)
    } catch (error) {
        console.error('get chat histories failed:', error)
        throw error
    }
}

/**
 * Get data lookup handler.
 * @param entity entity name
 * @param ids record ids
 * @returns raw database rows
 */
export const getDataLookup_ = async (
    region: DataRegion,
    entity: DataLookupEntity,
    ids: string[],
): Promise<Record<string, unknown>[]> => {
    try {
        return await lookupData(region, entity, ids)
    } catch (error) {
        console.error('get data lookup failed: ', error)
        throw error
    }
}

/**
 * Update user permission handler.
 * @param userId target user id
 * @param role new role
 * @param editedBy current user id
 * @returns updated user id and role
 */
export const updateUserPermission_ = async (
    region: DataRegion,
    userId: string,
    role: number,
    editedBy: string,
): Promise<void> => {
    if (editedBy === userId) throw new Error('CANNOT_UPDATE_SELF')

    let rows: Record<string, unknown>[]
    try {
        rows = await lookupData(region, 'users', [editedBy, userId])
    } catch (error) {
        console.error('lookup user permission rows failed: ', error)
        throw error
    }

    const editor = rows.find((row) => row.id === editedBy)
    const targetUser = rows.find((row) => row.id === userId)
    if (!editor || !targetUser) throw new Error('USER_NOT_FOUND')

    const editorRole = editor.role as number

    if ((targetUser.role as number) <= editorRole) throw new Error('FORBIDDEN_UPDATE_PERMISSION')
    if (role <= editorRole) throw new Error('FORBIDDEN_UPDATE_PERMISSION')

    try {
        await updateUserPermission(region, userId, role)
    } catch (error) {
        console.error('update user permission failed: ', error)
        throw error
    }

    return
}
