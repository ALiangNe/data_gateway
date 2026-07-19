import { lookupData } from '../../../repositories/dataLookup'
import { queryUsers, updateUserPermission } from '../../../repositories/user'
import { queryUserBehaviorLogs, queryUserBehaviorStats } from '../../../repositories/userBehaviorLog'
import { queryUserMemory } from '../../../repositories/userMemory'
import { getLocationByIp } from '../../../services/maxmind'
import type { DataListResult, DataRegion, OrderBy, Sort, User, UserBehaviorLogAggregate, UserBehaviorLogAggregateBy, UserBehaviorStatsQueryResult, UserBehaviorStatsResult } from '../../../type'

/**
 * Get users handler.
 * @param params - Query params.
 * @returns - { items: User[], total: number }.
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
        const { items, total } = await queryUsers(
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
            items: items.map((row) => ({
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

    for (const row of result.items) {
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

    const items: UserBehaviorLogAggregate[] = []

    for (const row of result.items) {
        const clientIps = []

        for (const item of row.clientIps) {
            clientIps.push({
                value: locationCache.get(item.value)!,
            })
        }

        items.push({
            ...row,
            clientIps,
        })
    }

    return {
        items,
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
