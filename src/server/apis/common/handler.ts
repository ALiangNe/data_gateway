import { lookupData } from '../../../repositories/dataLookup'
import type { DataLookupEntity, DataRegion } from '../../../type'

/**
 * Get data lookup handler.
 * @param entity entity name
 * @param ids record ids
 * @returns raw database rows
 */
export const getDataLookup_ = async (params: {
    region: DataRegion
    entity: DataLookupEntity
    ids: string[]
}): Promise<Record<string, unknown>[]> => {
    const { region, entity, ids } = params

    try {
        return await lookupData(region, entity, ids)
    } catch (error) {
        console.error('get data lookup failed: ', error)
        throw error
    }
}
