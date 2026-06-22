/**
 * Chat history repository
 */
import { pgClient, parseError } from '../modules/pg'
import type { ChatHistory } from '../type'
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
 * @param startUtc range start UTC time
 * @param endUtc range end UTC time
 * @returns distinct local dates in YYYY-MM-DD format
 */
export const queryChatActiveDates = async (
    userId: string,
    startUtc: string,
    endUtc: string,
): Promise<string[]> => {
    if (!pgClient) throw 'POSTGRES_NOT_READY'

    const sql = `
        SELECT DISTINCT TO_CHAR(created_at AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD') AS date
        FROM ${CHAT_HISTORY_TABLE}
        WHERE user_id = $1
          AND created_at >= $2
          AND created_at < $3
        ORDER BY date
    `

    let res: QueryResult<{ date: string }>
    try {
        res = await pgClient.query(sql, [userId, startUtc, endUtc])
    } catch (error) {
        throw parseError(error)
    }

    return res.rows.map((row) => row.date)
}

/**
 * Query chat histories in time range
 * @param userId user id
 * @param soulId soul id
 * @param startUtc range start UTC time
 * @param endUtc range end UTC time
 * @returns chat history list
 */
export const queryChatHistoriesByDate = async (
    userId: string,
    soulId: string,
    startUtc: string,
    endUtc: string,
): Promise<ChatHistory[]> => {
    if (!pgClient) throw 'POSTGRES_NOT_READY'

    const sql = `
        SELECT id, role, content, created_at
        FROM ${CHAT_HISTORY_TABLE}
        WHERE user_id = $1
          AND soul_id = $2
          AND created_at >= $3
          AND created_at < $4
        ORDER BY created_at ASC, CASE WHEN role = 'user' THEN 0 ELSE 1 END ASC
    `

    let res: QueryResult<{ id: string; role: string; content: string; created_at: Date }>
    try {
        res = await pgClient.query(sql, [userId, soulId, startUtc, endUtc])
    } catch (error) {
        throw parseError(error)
    }

    return res.rows.map((row) => toChatHistory(row))
}
