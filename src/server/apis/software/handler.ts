import axios from 'axios'
import { OTA_SERVICE_HOST, OTA_SERVICE_PORT } from '../../../config'
import type { DataListResult, Software, SoftwareUploadPostParams, SoftwareUploadPostResult } from '../../../type'

/**
 * List software handler.
 * @param params software list query
 * @returns paginated software list
 */
export const listSoftware_ = async (
    params: {
        page: number
        pageSize: number
        type?: string
        name?: string
        version?: string
        status?: string
    },
): Promise<DataListResult<Software>> => {
    if (!OTA_SERVICE_HOST || !OTA_SERVICE_PORT) throw new Error('OTA_SERVICE_NOT_CONFIGURED')

    let res
    try {
        res = await axios.get(`http://${OTA_SERVICE_HOST}:${OTA_SERVICE_PORT}/software/list`, { params })
    } catch (error) {
        console.error('list software failed: ', error)
        throw error
    }

    return {
        list: res.data.data.items,
        total: res.data.data.total,
    }
}

/**
 * Get software versions handler.
 * @param name software name
 * @returns software versions sorted by ota service
 */
export const getSoftwareVersions_ = async (
    name: string,
): Promise<string[]> => {
    if (!OTA_SERVICE_HOST || !OTA_SERVICE_PORT) throw new Error('OTA_SERVICE_NOT_CONFIGURED')

    let res
    try {
        res = await axios.get(`http://${OTA_SERVICE_HOST}:${OTA_SERVICE_PORT}/software/verions`, {
            params: { name },
        })
    } catch (error) {
        console.error('get software versions failed: ', error)
        throw error
    }

    return res.data.data as string[]
}

/**
 * Get upload post handler.
 * @param params software upload metadata
 * @returns software id and S3 upload post
 */
export const getUploadPost_ = async (
    params: SoftwareUploadPostParams,
): Promise<SoftwareUploadPostResult> => {
    if (!OTA_SERVICE_HOST || !OTA_SERVICE_PORT) throw new Error('OTA_SERVICE_NOT_CONFIGURED')

    let res
    try {
        res = await axios.post(`http://${OTA_SERVICE_HOST}:${OTA_SERVICE_PORT}/software/upload-post`, params)
    } catch (error) {
        console.error('get upload post failed: ', error)
        throw error
    }

    return res.data.data as SoftwareUploadPostResult
}

/**
 * Complete upload handler.
 * @param id software id
 * @param checksum file checksum
 * @returns void
 */
export const completeUpload_ = async (
    id: string,
    checksum: string,
): Promise<void> => {
    if (!OTA_SERVICE_HOST || !OTA_SERVICE_PORT) throw new Error('OTA_SERVICE_NOT_CONFIGURED')

    try {
        await axios.post(`http://${OTA_SERVICE_HOST}:${OTA_SERVICE_PORT}/software/complete-upload`, {
            id,
            checksum,
        })
    } catch (error) {
        console.error('complete upload failed: ', error)
        throw error
    }
}
