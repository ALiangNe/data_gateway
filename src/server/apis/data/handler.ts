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
import type { Bot, ChatHistory, DataListResult, DataLookupEntity, DataRegion, Knowledge, McpCapability, MonitorTraceDetail, OrderBy, Sort, User, UserBehaviorLogAggregate, UserBehaviorLogAggregateBy, UserBehaviorStatsQueryResult, UserBehaviorStatsResult } from '../../../type'

/**
 * Get bots handler.
 * @param params - Query params.
 * @returns - { list: Bot[], total: number }.
 */
export const getBots_ = async (params: {
    region: DataRegion
    page: number
    pageSize: number
    sortBy: OrderBy
    order: Sort
    model?: string
    serialNumber?: string
    manufacturer?: string
    status?: string
}): Promise<DataListResult<Bot>> => {
    const { region, page, pageSize, sortBy, order, model, serialNumber, manufacturer, status } = params

    try {
        return await queryBots(
            region,
            page,
            pageSize,
            sortBy,
            order,
            model,
            serialNumber,
            manufacturer,
            status,
        )
    } catch (error) {
        console.error('get bots failed: ', error)
        throw error
    }
}

/**
 * Get knowledge handler.
 * @param params - Query params.
 * @returns - { list: Knowledge[], total: number }.
 */
export const getKnowledge_ = async (params: {
    region: DataRegion
    page: number
    pageSize: number
    sortBy: OrderBy
    order: Sort
    document?: string
}): Promise<DataListResult<Knowledge>> => {
    const { region, page, pageSize, sortBy, order, document } = params

    try {
        return await queryKnowledge(
            region,
            page,
            pageSize,
            sortBy,
            order,
            document,
        )
    } catch (error) {
        console.error('get knowledge failed: ', error)
        throw error
    }
}

/**
 * Get MCP capabilities handler.
 * @param params - Query params.
 * @returns - { list: McpCapability[], total: number }.
 */
export const getMcpCapabilities_ = async (params: {
    region: DataRegion
    page: number
    pageSize: number
    sortBy: OrderBy
    order: Sort
    document?: string
}): Promise<DataListResult<McpCapability>> => {
    const { region, page, pageSize, sortBy, order, document } = params

    try {
        return await queryMcpCapabilities(
            region,
            page,
            pageSize,
            sortBy,
            order,
            document,
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
export const getMonitorLogsTrace_ = async (params: {
    region: DataRegion
    traceId: string
}): Promise<MonitorTraceDetail | null> => {
    const { region, traceId } = params

    try {
        return await queryMonitorLogsTrace(region, traceId)
    } catch (error) {
        console.error('get monitor logs trace failed: ', error)
        throw error
    }
}

/**
 * Get users handler.
 * @param params - Query params.
 * @returns - { list: User[], total: number }.
 */
export const getUsers_ = async (params: {
    region: DataRegion
    page?: number
    pageSize?: number
    sortBy: OrderBy
    order: Sort
    username?: string
    email?: string
    status?: User['status']
    role?: number
    createdAt?: [string?, string?]
    updatedAt?: [string?, string?]
}): Promise<DataListResult<User>> => {
    const { region, page, pageSize, sortBy, order, username, email, status, role, createdAt, updatedAt } = params

    try {
        const { list, total } = await queryUsers(
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
export const getUserBehaviorLogs_ = async (params: {
    region: DataRegion
    page: number
    pageSize: number
    order: Sort
    aggregateBy: UserBehaviorLogAggregateBy
    userId?: string
    createdAt?: [string?, string?]
}): Promise<DataListResult<UserBehaviorLogAggregate>> => {
    const { region, page, pageSize, order, aggregateBy, userId, createdAt } = params
    let result: DataListResult<UserBehaviorLogAggregate>

    try {
        result = await queryUserBehaviorLogs(
            region,
            page,
            pageSize,
            order,
            aggregateBy,
            userId,
            createdAt,
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
export const getUserBehaviorStats_ = async (params: {
    region: DataRegion
    createdAt?: [string?, string?]
}): Promise<UserBehaviorStatsResult> => {
    const { region, createdAt } = params
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
export const getUserMemory_ = async (params: {
    region: DataRegion
    userId: string
    soulId: string
}): Promise<string> => {
    const { region, userId, soulId } = params

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
export const getDataLookup_ = async (params: {
    region: DataRegion
    entity: DataLookupEntity
    ids: string[]
}): Promise<Record<string, unknown>[]> => {
    const { region, entity, ids } = params

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
export const updateUserPermission_ = async (params: {
    region: DataRegion
    userId: string
    role: number
    editedBy: string
}): Promise<void> => {
    const { region, userId, role, editedBy } = params

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
