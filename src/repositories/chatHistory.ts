/**
 * Chat history repository
 */
import { parseError, pgClients } from '../modules/pg'
import type { ChatHistory, DataRegion } from '../type'
import type { QueryResult } from 'pg'

const CHAT_HISTORY_TABLE = 'chat_histories'

const toChatHistory = (row: Record<string, unknown>): ChatHistory => {
    return {
        id: row.id as string,
        role: row.role as string,
        content: row.content as string,
        userId: row.user_id as string,
        soulId: row.soul_id as string,
        conversationId: row.conversation_id as string,
        topicId: row.topic_id as string | null,
        metadata: row.metadata as ChatHistory['metadata'],
        createdAt: row.created_at as Date,
        updatedAt: row.updated_at as Date,
    }
}

/**
 * Query distinct chat active dates in time range
 * @param userId user id
 * @param createdAt created_at range filter
 * @returns distinct local dates in YYYY-MM-DD format
 */
export const queryChatActiveDates = async (
    region: DataRegion,
    userId: string,
    createdAt: [string, string],
): Promise<string[]> => {
    const client = pgClients[region]
    if (!client) throw 'PG_CLIENT_NOT_READY'

    const sql = `
        SELECT DISTINCT TO_CHAR(created_at, 'YYYY-MM-DD') AS date
        FROM ${CHAT_HISTORY_TABLE}
        WHERE user_id = $1
          AND created_at >= $2
          AND created_at < $3
        ORDER BY date
    `

    let res: QueryResult<{ date: string }>
    try {
        res = await client.query(sql, [userId, createdAt[0], createdAt[1]])
    } catch (error) {
        throw parseError(error)
    }

    return res.rows.map((row) => row.date)
}

/**
 * Query chat histories in time range
 * @param userId user id
 * @param soulId soul id
 * @param createdAt created_at range filter
 * @returns chat history list
 */
export const queryChatHistories = async (
    region: DataRegion,
    userId: string,
    soulId: string,
    createdAt: [string, string],
): Promise<ChatHistory[]> => {
    const client = pgClients[region]
    if (!client) throw 'PG_CLIENT_NOT_READY'

    const values: unknown[] = []
    const conditions: string[] = []

    for (const [column, value] of [
        ['user_id', userId],
        ['soul_id', soulId],
    ] as const) {
        conditions.push(`${column} = $${values.length + 1}`)
        values.push(value)
    }

    if (createdAt) {
        const [start, end] = createdAt
        if (start != null && start !== '') {
            conditions.push(`created_at >= $${values.length + 1}`)
            values.push(start)
        }
        if (end != null && end !== '') {
            conditions.push(`created_at < $${values.length + 1}`)
            values.push(end)
        }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const sql = `
        SELECT id, role, content, created_at
        FROM ${CHAT_HISTORY_TABLE}
        ${whereClause}
        ORDER BY created_at ASC, CASE WHEN role = 'user' THEN 0 ELSE 1 END ASC
    `

    let res: QueryResult<{ id: string; role: string; content: string; created_at: Date }>
    try {
        res = await client.query(sql, values)
    } catch (error) {
        throw parseError(error)
    }

    return res.rows.map((row) => toChatHistory(row))
}
