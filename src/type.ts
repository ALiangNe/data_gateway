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
    model: string
    serialNumber: string
    manufacturer: string
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
    parentSpanId: string | null
    env: string
    service: string
    instanceId: string
    eventName: string
    status: string
    startTimeMs: number
    durationMs: number
    error?: string | null
    traceAttributes?: Record<string, unknown>
    metadata?: Record<string, unknown>
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

export interface Software {
    id: string
    type: string
    name: string
    version: string
    dependencies: Record<string, string>
    changelog: string
    storageKey: string
    sizeBytes: number
    checksum: string
    signature: string
    status: string
    metadata: Record<string, unknown>
    uploadedBy: string
    createdAt: Date
    updatedAt: Date
}

export interface UserBehaviorLog {
    deviceId: string
    sessionId: string
    userId: string | null
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

export type UserBehaviorStatsQueryResult = {
    deviceCount: number
    sessionCount: number
    sessions: {
        deviceId: string
        createdAt: Date
    }[]
    clientIps: string[]
    mediaClickEvents: {
        eventName: string
        count: number
    }[]
}

export type UserBehaviorStatsResult = {
    deviceCount: number
    sessionCount: number
    sessions: {
        deviceId: string
        createdAt: string
    }[]
    regions: {
        key: string
        count: number
    }[]
    mediaClickEvents: {
        eventName: string
        count: number
    }[]
}

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

export type DataLookupEntity =
    | 'authProviders'
    | 'bots'
    | 'chatHistories'
    | 'chatTopics'
    | 'knowledge'
    | 'mcpCapabilities'
    | 'media'
    | 'monitorLogs'
    | 'souls'
    | 'software'
    | 'users'
    | 'userBehaviorLogs'
    | 'userMemories'

export type S3PresignedPost = {
    url: string
    fields: Record<string, string>
}

export type SoftwareUploadPostParams = {
    type: string
    name: string
    version: string
    dependencies: Record<string, string>
    changelog: string
    fileName: string
    mimeType: string
    sizeBytes: number
    checksum: string
}

export type SoftwareUploadPostResult = {
    id: string
    uploadPost: S3PresignedPost
}
