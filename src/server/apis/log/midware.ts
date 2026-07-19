import type { NextFunction, Request, Response } from 'express'
import type { DataRegion, MonitorTraceDetail } from '../../../type'
import { errObj } from '../../modules/errs'
import { getMonitorLogsTrace_ } from './handler'

/**
 * getMonitorLogsTrace middleware.
 */
export const _getMonitorLogsTrace = async (req: Request, res: Response, _next: NextFunction) => {
    const region = req.query.region as DataRegion
    const traceId = req.query.traceId as string | undefined

    if (!traceId || !region) {
        res.status(400).json({ ...errObj[400], errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_REGION' })
        return
    }

    let result: MonitorTraceDetail | null = null
    try {
        result = await getMonitorLogsTrace_({
            region,
            traceId,
        })
    } catch (error) {
        console.error('getMonitorLogsTrace failed: ', error)
        res.status(500).json({ ...errObj[500], errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200], data: result })
}
