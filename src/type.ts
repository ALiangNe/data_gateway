/**
 * Type definitions for data_gateway.
 */

// Redis connection configuration type
export type RedisCredential = {
    REDIS_HOSTS: string[]
    REDIS_PORT: number
    REDIS_PASSWORD: string
    REDIS_USE_CLUSTER?: boolean
    REDIS_USE_TLS?: boolean
    onReady: (...args: unknown[]) => void
    onError: (...args: unknown[]) => void
    onReconnecting: (...args: unknown[]) => void
}

export interface PgCredential {
    PG_HOST: string
    PG_PORT: number
    PG_USERNAME: string
    PG_PASSWORD: string
    PG_DATABASE: string
    PG_MAX_CONNECTIONS?: number
    PG_USE_TLS?: boolean
}

// Health
export type ReadinessStatus = 'UP' | 'DOWN'

export type ReadinessResult = {
    status: ReadinessStatus
    checks: {
        redis: ReadinessStatus
        pg: ReadinessStatus
    }
}

// Data API entities
export interface Bot {
    id: string
    ownerId: string
    platform: string
    status: string
    metadata: Record<string, unknown>
    registeredAt: Date | null
    activatedAt: Date | null
    createdAt: Date
    updatedAt: Date
}

export interface ChatHistory {
    id: string
    role: string
    content: string
    userId: string
    soulId: string
    conversationId: string
    topicId: string | null
    metadata: Record<string, unknown>
    createdAt: Date
    updatedAt: Date
}

export interface Knowledge {
    id: string
    document: string
    embedding: number[]
    metadata: Record<string, unknown>
    createdAt: Date
    updatedAt: Date
}

export interface McpCapability {
    id: string
    document: string
    embedding: number[]
    metadata: Record<string, unknown>
    createdAt: Date
    updatedAt: Date
}

export interface MonitorSpan {
    spanId: string
    parentSpanId: string
    env: string
    service: string
    instanceId: string
    name: string
    status: string
    botId?: string | null
    soulId?: string | null
    startTimeMs: number
    durationMs: number
    error?: string | null
    meta?: Record<string, unknown>
}

export interface MonitorTraceDetail {
    traceId: string
    spans: MonitorSpan[]
}

export interface User {
    id: string
    username: string
    password: string | null
    email: string
    role: number
    soulId: string
    status: 'ACTIVE' | 'BANNED' | 'DELETED'
    providers: string[]
    createdAt: Date
    updatedAt: Date
}

export interface UserBehaviorLog {
    deviceId: string
    sessionId: string
    userId: string | null
    platform: string
    userAgent: string
    screenSize: string | null
    language: string | null
    timezone: string | null
    referrer: string | null
    utmSource: string | null
    eventType: string
    eventName: string
    clientIp: string | null
    metadata: Record<string, unknown>
    createdAt: Date
}

export interface UserBehaviorValue {
    value: string
}

export interface UserBehaviorValueCount {
    value: string
    count: number
}

export interface UserBehaviorLogAggregateBase {
    platforms: UserBehaviorValue[]
    userAgents: UserBehaviorValue[]
    screenSizes: UserBehaviorValue[]
    languages: UserBehaviorValue[]
    timezones: UserBehaviorValue[]
    referrers: UserBehaviorValue[]
    utmSources: UserBehaviorValue[]
    clientIps: UserBehaviorValue[]
    eventTypes: UserBehaviorValueCount[]
    eventNames: UserBehaviorValueCount[]
    createdAt: Date
}

export interface UserBehaviorLogSessionAggregate extends UserBehaviorLogAggregateBase {
    sessionId: string
    deviceIds: UserBehaviorValue[]
    userIds: UserBehaviorValue[]
}

export interface UserBehaviorLogDeviceAggregate extends UserBehaviorLogAggregateBase {
    deviceId: string
    sessionIds: UserBehaviorValue[]
    userIds: UserBehaviorValue[]
}

export interface UserBehaviorLogUserAggregate extends UserBehaviorLogAggregateBase {
    userId: string
    sessionIds: UserBehaviorValue[]
    deviceIds: UserBehaviorValue[]
}

export type UserBehaviorLogAggregateBy =
    | 'session_id'
    | 'device_id'
    | 'user_id'

export type UserBehaviorLogAggregate =
    | UserBehaviorLogSessionAggregate
    | UserBehaviorLogDeviceAggregate
    | UserBehaviorLogUserAggregate

export type AggregateConfig = {
    groupFields: string[]
    aggregateFields: {
        key: string
        column: string
        withCount?: boolean
    }[]
    mapper: (row: Record<string, unknown>) => UserBehaviorLogAggregate
}

// Data list result
export type DataListResult<T> = {
    list: T[]
    total: number
}
