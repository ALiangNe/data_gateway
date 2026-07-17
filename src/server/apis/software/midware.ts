import type { NextFunction, Request, Response } from 'express'
import axios from 'axios'
import { errObj } from '../../modules/errs'
import type { DataListResult, Software } from '../../../type'
import { completeUpload_, getSoftwareVersions_, getUploadPost_, listSoftware_ } from './handler'

/**
 * List software middleware.
 */
export const _listSoftware = async (req: Request, res: Response, _next: NextFunction) => {
    const region = req.query.region as string
    const page = Number(req.query.page)
    const pageSize = Number(req.query.pageSize)
    const type = req.query.type as string | undefined
    const name = req.query.name as string | undefined
    const version = req.query.version as string | undefined
    const status = req.query.status as string | undefined

    if (!region) {
        res.status(400).json({ ...errObj[400], errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_REGION' })
        return
    }
    if (isNaN(page) || page < 1 || isNaN(pageSize) || pageSize < 1 || pageSize > 50) {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_PARAMETERS' })
        return
    }

    let result: DataListResult<Software> | null = null
    try {
        result = await listSoftware_({
            region,
            page,
            pageSize,
            type,
            name,
            version,
            status,
        })
    } catch (error) {
        console.error('listSoftware failed: ', error)
        if (axios.isAxiosError(error) && error.response) {
            res.status(error.response.status).json(error.response.data)
            return
        }
        res.status(500).json({ ...errObj[500], errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200], data: result })
}


/**
 * getSoftwareVersions middleware.
 */
export const _getSoftwareVersions = async (req: Request, res: Response, _next: NextFunction) => {
    const region = req.query.region as string
    const name = req.query.name as string

    if (!region || !name) {
        res.status(400).json({ ...errObj[400], errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_REGION' })
        return
    }

    let result: string[] = []
    try {
        result = await getSoftwareVersions_(region, name)
    } catch (error) {
        console.error('getSoftwareVersions failed: ', error)
        if (axios.isAxiosError(error) && error.response) {
            res.status(error.response.status).json(error.response.data)
            return
        }
        res.status(500).json({ ...errObj[500], errmsg: String(error) })
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
        res.status(400).json({ ...errObj[400], errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_REGION' })
        return
    }

    let result = null
    try {
        result = await getUploadPost_({
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
        })
    } catch (error) {
        console.error('getUploadPost failed: ', error)
        if (axios.isAxiosError(error) && error.response) {
            res.status(error.response.status).json(error.response.data)
            return
        }
        res.status(500).json({ ...errObj[500], errmsg: String(error) })
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
        res.status(400).json({ ...errObj[400], errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }
    if (region !== 'usw1' && region !== 'euc1') {
        res.status(400).json({ ...errObj[400], errmsg: 'INVALID_REGION' })
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
        res.status(500).json({ ...errObj[500], errmsg: String(error) })
        return
    }

    res.status(200).json({ ...errObj[200] })
}
