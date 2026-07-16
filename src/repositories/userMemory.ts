/**
 * User memory repository
 */
import { parseError, pgClients } from '../modules/pg'
import type { DataRegion } from '../type'
import type { QueryResult } from 'pg'

const USER_MEMORY_TABLE = 'user_memories'

/**
 * Query memory by user id and soul id
 * @param userId user id
 * @param soulId soul id
 * @returns memory text
 */
export const queryUserMemory = async (region: DataRegion, userId: string, soulId: string): Promise<string> => {
    const client = pgClients[region]
    if (!client) throw 'PG_CLIENT_NOT_READY'

    const sql = `
        SELECT memory
        FROM ${USER_MEMORY_TABLE}
        WHERE user_id = $1 AND soul_id = $2
        LIMIT 1
    `

    let res: QueryResult<{ memory: string }>
    try {
        res = await client.query(sql, [userId, soulId])
    } catch (error) {
        throw parseError(error)
    }

    return res.rows[0]?.memory ?? ''
}
