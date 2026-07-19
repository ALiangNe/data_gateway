import { queryMonitorLogsTrace } from '../../../repositories/monitorLog'
import type { DataRegion, MonitorTraceDetail } from '../../../type'

/**
 * Get monitor logs trace handler.
 * @param traceId - trace id
 * @returns monitor trace detail
 */
export const getMonitorLogsTrace_ = async (params: {
    region: DataRegion
    traceId: string
}): Promise<MonitorTraceDetail | null> => {
    const { region, traceId } = params

    try {
        return await queryMonitorLogsTrace(region, traceId)
    } catch (error) {
        console.error('get monitor logs trace failed: ', error)
        throw error
    }
}
