/**
 * Data lookup repository
 */
import { parseError, pgClients } from '../modules/pg'
import type { DataLookupEntity, DataRegion } from '../type'
import type { QueryResult } from 'pg'

const TABLE_MAP = {
    authProviders: 'auth_providers',
    bots: 'bots',
    chatHistories: 'chat_histories',
    chatTopics: 'chat_topics',
    knowledge: 'knowledge',
    mcpCapabilities: 'mcp_capabilities',
    media: 'media',
    monitorLogs: 'monitor_logs',
    souls: 'souls',
    software: 'software',
    users: 'users',
    userBehaviorLogs: 'user_behavior_logs',
    userMemories: 'user_memories',
} as const

const LOOKUP_COLUMN_MAP: Partial<Record<DataLookupEntity, string>> = {
    monitorLogs: 'span_id',
    userBehaviorLogs: 'session_id',
}

/**
 * Lookup records by entity and ids
 * @param entity entity name
 * @param ids record ids
 * @returns raw database rows
 */
export const lookupData = async (
    region: DataRegion,
    entity: string,
    ids: string[],
): Promise<Record<string, unknown>[]> => {
    const client = pgClients[region]
    if (!client) throw 'PG_CLIENT_NOT_READY'
    if (!(entity in TABLE_MAP)) throw 'INVALID_ENTITY'
    if (ids.length === 0) return []

    const tableName = TABLE_MAP[entity as DataLookupEntity]
    const column = LOOKUP_COLUMN_MAP[entity as DataLookupEntity] ?? 'id'
    const sql = `
        SELECT * FROM ${tableName}
        WHERE ${column} = ANY($1)
    `

    let res: QueryResult<Record<string, unknown>>
    try {
        res = await client.query(sql, [ids])
    } catch (error) {
        throw parseError(error)
    }

    return res.rows
}
