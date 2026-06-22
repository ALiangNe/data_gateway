/**
 * User memory repository
 */
import { pgClient, parseError } from '../modules/pg'
import type { QueryResult } from 'pg'

const USER_MEMORY_TABLE = 'user_memories'

/**
 * Query memory by user id and soul id
 * @param userId user id
 * @param soulId soul id
 * @returns memory text
 */
export const queryUserMemoriesByUserId = async (userId: string, soulId: string): Promise<string> => {
    if (!pgClient) throw 'POSTGRES_NOT_READY'

    const sql = `
        SELECT memory
        FROM ${USER_MEMORY_TABLE}
        WHERE user_id = $1 AND soul_id = $2
        LIMIT 1
    `

    let res: QueryResult<{ memory: string }>
    try {
        res = await pgClient.query(sql, [userId, soulId])
    } catch (error) {
        throw parseError(error)
    }

    return res.rows[0]?.memory ?? ''
}
