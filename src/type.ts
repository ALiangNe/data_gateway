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

export interface MonitorLog {
    service: string
    env: string
    instanceId: number
    traceId: string
    spanId: string
    parentSpanId: string | null
    name: string
    startTimeMs: number
    durationMs: number
    status: string
    botId: string | null
    soulId: string | null
    meta: Record<string, unknown>
    error: Record<string, unknown> | null
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

export interface UserBehaviorValueCount {
    value: string
    count: number
}

export interface UserBehaviorLogAggregate {
    sessionId: string
    deviceId: string
    userIds: UserBehaviorValueCount[]
    platforms: UserBehaviorValueCount[]
    userAgents: UserBehaviorValueCount[]
    screenSizes: UserBehaviorValueCount[]
    languages: UserBehaviorValueCount[]
    timezones: UserBehaviorValueCount[]
    referrers: UserBehaviorValueCount[]
    utmSources: UserBehaviorValueCount[]
    eventTypes: UserBehaviorValueCount[]
    eventNames: UserBehaviorValueCount[]
    clientIps: UserBehaviorValueCount[]
    createdAt: Date
}

// Data list result
export type DataListResult<T> = {
    list: T[]
    total: number
}
