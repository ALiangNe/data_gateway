import { queryKnowledge } from '../../../repositories/knowledge'
import { queryMcpCapabilities } from '../../../repositories/mcpCapability'
import type { DataListResult, DataRegion, Knowledge, McpCapability, OrderBy, Sort } from '../../../type'

/**
 * Get knowledge handler.
 * @param params - Query params.
 * @returns - { list: Knowledge[], total: number }.
 */
export const getKnowledge_ = async (params: {
    region: DataRegion
    page: number
    pageSize: number
    sortBy: OrderBy
    order: Sort
    document?: string
}): Promise<DataListResult<Knowledge>> => {
    const { region, page, pageSize, sortBy, order, document } = params

    try {
        return await queryKnowledge(
            region,
            page,
            pageSize,
            sortBy,
            order,
            document,
        )
    } catch (error) {
        console.error('get knowledge failed: ', error)
        throw error
    }
}

/**
 * Get MCP capabilities handler.
 * @param params - Query params.
 * @returns - { list: McpCapability[], total: number }.
 */
export const getMcpCapabilities_ = async (params: {
    region: DataRegion
    page: number
    pageSize: number
    sortBy: OrderBy
    order: Sort
    document?: string
}): Promise<DataListResult<McpCapability>> => {
    const { region, page, pageSize, sortBy, order, document } = params

    try {
        return await queryMcpCapabilities(
            region,
            page,
            pageSize,
            sortBy,
            order,
            document,
        )
    } catch (error) {
        console.error('get MCP capabilities failed: ', error)
        throw error
    }
}
