import { queryBots } from '../../../repositories/bot'
import type { Bot, DataListResult, DataRegion, OrderBy, Sort } from '../../../type'

/**
 * Get bots handler.
 * @param params - Query params.
 * @returns - { list: Bot[], total: number }.
 */
export const getBots_ = async (params: {
    region: DataRegion
    page: number
    pageSize: number
    sortBy: OrderBy
    order: Sort
    model?: string
    serialNumber?: string
    manufacturer?: string
    status?: string
}): Promise<DataListResult<Bot>> => {
    const { region, page, pageSize, sortBy, order, model, serialNumber, manufacturer, status } = params

    try {
        return await queryBots(
            region,
            page,
            pageSize,
            sortBy,
            order,
            model,
            serialNumber,
            manufacturer,
            status,
        )
    } catch (error) {
        console.error('get bots failed: ', error)
        throw error
    }
}
