import axios from 'axios'
import { OTA_EUC1_HOST, OTA_EUC1_PORT, OTA_USW1_HOST, OTA_USW1_PORT } from '../../../config'
import type { DataListResult, DataRegion, Software, SoftwareUploadPostResult } from '../../../type'

const getOtaService = (region: DataRegion) => {
    return region === 'usw1'
        ? { host: OTA_USW1_HOST, port: OTA_USW1_PORT }
        : { host: OTA_EUC1_HOST, port: OTA_EUC1_PORT }
}

/**
 * List software handler.
 * @returns paginated software list
 */
export const listSoftware_ = async (
    region: DataRegion,
    page: number,
    pageSize: number,
    type?: string,
    name?: string,
    version?: string,
    status?: string,
): Promise<DataListResult<Software>> => {
    const { host, port } = getOtaService(region)
    if (!host || !port) throw new Error('OTA_SERVICE_NOT_CONFIGURED')

    let res
    try {
        res = await axios.get(`http://${host}:${port}/software/list`, {
            params: {
                page,
                pageSize,
                type,
                name,
                version,
                status,
            },
        })
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
    region: DataRegion,
    name: string,
): Promise<string[]> => {
    const { host, port } = getOtaService(region)
    if (!host || !port) throw new Error('OTA_SERVICE_NOT_CONFIGURED')

    let res
    try {
        res = await axios.get(`http://${host}:${port}/software/verions`, {
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
 * @returns software id and S3 upload post
 */
export const getUploadPost_ = async (
    region: DataRegion,
    type: string,
    name: string,
    version: string,
    dependencies: Record<string, string>,
    changelog: string,
    fileName: string,
    mimeType: string,
    sizeBytes: number,
    checksum: string,
): Promise<SoftwareUploadPostResult> => {
    const { host, port } = getOtaService(region)
    if (!host || !port) throw new Error('OTA_SERVICE_NOT_CONFIGURED')

    let res
    try {
        res = await axios.post(`http://${host}:${port}/software/upload-post`, {
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
    region: DataRegion,
    id: string,
    checksum: string,
): Promise<void> => {
    const { host, port } = getOtaService(region)
    if (!host || !port) throw new Error('OTA_SERVICE_NOT_CONFIGURED')

    try {
        await axios.post(`http://${host}:${port}/software/complete-upload`, {
            id,
            checksum,
        })
    } catch (error) {
        console.error('complete upload failed: ', error)
        throw error
    }
}
