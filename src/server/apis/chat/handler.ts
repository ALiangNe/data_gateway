import { queryChatActiveDates, queryChatHistories } from '../../../repositories/chatHistory'
import type { ChatHistory, DataRegion } from '../../../type'

/**
 * Get chat active dates handler.
 * @param userId user id
 * @param createdAt UTC createdAt range filter
 * @returns distinct local dates in YYYY-MM-DD format
 */
export const getChatActiveDates_ = async (params: {
    region: DataRegion
    userId: string
    createdAt: [string, string]
}): Promise<string[]> => {
    const { region, userId, createdAt } = params

    try {
        return await queryChatActiveDates(region, userId, createdAt)
    } catch (error) {
        console.error('get chat active dates failed: ', error)
        throw error
    }
}

/**
 * Get chat histories handler.
 * @param userId user id
 * @param soulId soul id
 * @param createdAt UTC createdAt range filter
 * @returns chat history list in createdAt range
 */
export const getChatHistories_ = async (params: {
    region: DataRegion
    userId: string
    soulId: string
    createdAt: [string, string]
}): Promise<ChatHistory[]> => {
    const { region, userId, soulId, createdAt } = params

    try {
        return await queryChatHistories(region, userId, soulId, createdAt)
    } catch (error) {
        console.error('get chat histories failed:', error)
        throw error
    }
}
