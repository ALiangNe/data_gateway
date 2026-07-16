import type { NextFunction, Request, Response } from 'express'
import axios from 'axios'
import { errObj } from '../../modules/errs'
import type { DataListResult, Software } from '../../../type'
import { completeUpload_, getSoftwareVersions_, getUploadPost_, listSoftware_ } from './handler'

/**
 * listSoftware middleware.
 */
export const _listSoftware = async (req: Request, res: Response, _next: NextFunction) => {
    const { region, page, pageSize, type, name, version, status } = req.query

    if (!region || !page || !pageSize) {
        res.status(400).json({ errno: 400, errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ errno: 400, errmsg: 'INVALID_REGION' })
        return
    }

    let result: DataListResult<Software> = { list: [], total: 0 }
    try {
        result = await listSoftware_(
            region,
            Number(page),
            Number(pageSize),
            type as string,
            name as string,
            version as string,
            status as string,
        )
    } catch (error) {
        console.error('listSoftware failed: ', error)
        if (axios.isAxiosError(error) && error.response) {
            res.status(error.response.status).json(error.response.data)
            return
        }
        res.status(500).json({ errno: 500, errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200], data: result })
}


/**
 * getSoftwareVersions middleware.
 */
export const _getSoftwareVersions = async (req: Request, res: Response, _next: NextFunction) => {
    const { region, name } = req.query

    if (!region || !name) {
        res.status(400).json({ errno: 400, errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ errno: 400, errmsg: 'INVALID_REGION' })
        return
    }

    let result: string[] = []
    try {
        result = await getSoftwareVersions_(region, name as string)
    } catch (error) {
        console.error('getSoftwareVersions failed: ', error)
        if (axios.isAxiosError(error) && error.response) {
            res.status(error.response.status).json(error.response.data)
            return
        }
        res.status(500).json({ errno: 500, errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200], data: result })
}


/**
 * getUploadPost middleware.
 */
export const _getUploadPost = async (req: Request, res: Response, _next: NextFunction) => {
    const { region, type, name, version, dependencies, changelog, fileName, mimeType, sizeBytes, checksum } = req.body

    if (!region || !type || !name || !version || !dependencies || !changelog || !fileName || !mimeType || sizeBytes == null || !checksum) {
        res.status(400).json({ errno: 400, errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ errno: 400, errmsg: 'INVALID_REGION' })
        return
    }

    let result = null
    try {
        result = await getUploadPost_(
            region,
            type,
            name,
            version,
            dependencies,
            changelog,
            fileName,
            mimeType,
            sizeBytes,
            checksum,
        )
    } catch (error) {
        console.error('getUploadPost failed: ', error)
        if (axios.isAxiosError(error) && error.response) {
            res.status(error.response.status).json(error.response.data)
            return
        }
        res.status(500).json({ errno: 500, errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200], data: result })
}


/**
 * completeUpload middleware.
 */
export const _completeUpload = async (req: Request, res: Response, _next: NextFunction) => {
    const { region, id, checksum } = req.body

    if (!region || !id || !checksum) {
        res.status(400).json({ errno: 400, errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ errno: 400, errmsg: 'INVALID_REGION' })
        return
    }

    try {
        await completeUpload_(region, id, checksum)
    } catch (error) {
        console.error('completeUpload failed: ', error)
        if (axios.isAxiosError(error) && error.response) {
            res.status(error.response.status).json(error.response.data)
            return
        }
        res.status(500).json({ errno: 500, errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200] })
}
