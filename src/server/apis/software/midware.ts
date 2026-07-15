import type { NextFunction, Request, Response } from 'express'
import axios from 'axios'
import { errObj } from '../../modules/errs'
import type { DataListResult, Software } from '../../../type'
import { completeUpload_, getSoftwareVersions_, getUploadPost_, listSoftware_ } from './handler'

/**
 * getUploadPost middleware.
 */
export const _getUploadPost = async (req: Request, res: Response, _next: NextFunction) => {
    const { type, name, version, dependencies, changelog, fileName, mimeType, sizeBytes, checksum } = req.body

    if (!type || !name || !version || !dependencies || !changelog || !fileName || !mimeType || sizeBytes == null || !checksum) {
        res.status(400).json({ errno: 400, errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }

    let result = null
    try {
        result = await getUploadPost_(
            {
                type,
                name,
                version,
                dependencies,
                changelog,
                fileName,
                mimeType,
                sizeBytes,
                checksum,
            },
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
    const { id, checksum } = req.body

    if (!id || !checksum) {
        res.status(400).json({ errno: 400, errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }

    try {
        await completeUpload_(id, checksum)
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


/**
 * listSoftware middleware.
 */
export const _listSoftware = async (req: Request, res: Response, _next: NextFunction) => {
    const { page, pageSize, type, name, version, status } = req.query

    if (!page || !pageSize) {
        res.status(400).json({ errno: 400, errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }

    let result: DataListResult<Software> = { list: [], total: 0 }
    try {
        result = await listSoftware_({
            page: Number(page),
            pageSize: Number(pageSize),
            type: type as string,
            name: name as string,
            version: version as string,
            status: status as string,
        })
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
    const { name } = req.query

    if (!name) {
        res.status(400).json({ errno: 400, errmsg: 'MISSING_REQUIRED_PARAMETERS' })
        return
    }

    let result: string[] = []
    try {
        result = await getSoftwareVersions_(name as string)
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
