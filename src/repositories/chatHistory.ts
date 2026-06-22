/**
 * Chat history repository
 */
import { pgClient, parseError } from '../modules/pg'
import type { ChatHistory, DataListResult } from '../type'
import type { QueryResult } from 'pg'

const CHAT_HISTORY_TABLE = 'chat_histories'

const CHAT_HISTORY_COLUMN_MAP: Record<string, string> = {
    id: 'id',
    role: 'role',
    content: 'content',
    userId: 'user_id',
    soulId: 'soul_id',
    conversationId: 'conversation_id',
    topicId: 'topic_id',
    metadata: 'metadata',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
}

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
 * Query chat histories with pagination and ordering
 * @param filters filter criteria
 * @param page page number
 * @param pageSize items per page
 * @param sortBy sort field
 * @param order sort direction
 * @returns chat history list and total count
 */
export const queryChatHistories = async (
    filters: Record<string, unknown> = {},
    page: number = 1,
    pageSize: number = 20,
    sortBy: string = 'createdAt',
    order: 'asc' | 'desc' = 'desc',
): Promise<DataListResult<ChatHistory>> => {
    if (!pgClient) throw 'POSTGRES_NOT_READY'

    if (!Number.isFinite(page) || page < 1) throw 'INVALID_PAGE'
    if (!Number.isFinite(pageSize) || pageSize <= 0) throw 'INVALID_PAGE_SIZE'
    if (order !== 'asc' && order !== 'desc') throw 'INVALID_ORDER'

    const values: unknown[] = []
    const conditions: string[] = []

    for (const [key, value] of Object.entries(filters)) {
        if (value === undefined) continue

        const col = CHAT_HISTORY_COLUMN_MAP[key]
        if (!col) throw 'INVALID_QUERY_KEYS'

        if (!Array.isArray(value)) {
            conditions.push(`${col} = $${values.length + 1}`)
            values.push(value)
            continue
        }

        const [start, end] = value as [unknown?, unknown?]
        if (start != null && start !== '') {
            conditions.push(`${col} >= $${values.length + 1}`)
            values.push(start)
        }
        if (end != null && end !== '') {
            conditions.push(`${col} <= $${values.length + 1}`)
            values.push(end)
        }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const orderCol = CHAT_HISTORY_COLUMN_MAP[sortBy]
    if (!orderCol) throw 'INVALID_SORT_BY'

    const countSql = `SELECT COUNT(*)::int AS total FROM ${CHAT_HISTORY_TABLE} ${whereClause}`

    values.push(pageSize, (page - 1) * pageSize)
    const sql = `
        SELECT * FROM (
            SELECT * FROM ${CHAT_HISTORY_TABLE}
            ${whereClause}
            ORDER BY ${orderCol} ${order === 'asc' ? 'ASC' : 'DESC'}
            LIMIT $${values.length - 1} OFFSET $${values.length}
        ) t
        ORDER BY ${orderCol} ${order === 'asc' ? 'ASC' : 'DESC'}${orderCol === 'created_at' ? ', CASE WHEN role = \'user\' THEN 0 ELSE 1 END ASC' : ''}
    `

    let countRes: QueryResult<{ total: number }>
    let res: QueryResult<Record<string, unknown>>
    try {
        [countRes, res] = await Promise.all([
            pgClient.query(countSql, values.slice(0, values.length - 2)),
            pgClient.query(sql, values),
        ])
    } catch (error) {
        throw parseError(error)
    }

    return {
        list: res.rows.map((row) => toChatHistory(row)),
        total: countRes.rows[0]?.total as number,
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
 * @param startUtc range start UTC time
 * @param endUtc range end UTC time
 * @returns chat history list
 */
export const queryChatHistoriesByDate = async (
    userId: string,
    startUtc: string,
    endUtc: string,
): Promise<ChatHistory[]> => {
    if (!pgClient) throw 'POSTGRES_NOT_READY'

    const sql = `
        SELECT id, role, content, created_at
        FROM ${CHAT_HISTORY_TABLE}
        WHERE user_id = $1
          AND created_at >= $2
          AND created_at < $3
        ORDER BY created_at ASC, CASE WHEN role = 'user' THEN 0 ELSE 1 END ASC
    `

    let res: QueryResult<{ id: string; role: string; content: string; created_at: Date }>
    try {
        res = await pgClient.query(sql, [userId, startUtc, endUtc])
    } catch (error) {
        throw parseError(error)
    }

    return res.rows.map((row) => toChatHistory(row))
}
