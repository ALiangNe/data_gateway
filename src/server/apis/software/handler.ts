import axios from 'axios'
import { OTA_HOST_EUC1, OTA_PORT_EUC1, OTA_HOST_USW1, OTA_PORT_USW1 } from '../../../config'
import type { DataListResult, DataRegion, Software, SoftwareUploadPostResult } from '../../../type'

const getOtaConfig = (region: DataRegion) => {
    if (region === 'usw1') return { host: OTA_HOST_USW1, port: OTA_PORT_USW1 }
    if (region === 'euc1') return { host: OTA_HOST_EUC1, port: OTA_PORT_EUC1 }
    throw new Error('INVALID_REGION')
}

/**
 * List software handler.
 * @returns paginated software list
 */
export const listSoftware_ = async (params: {
    region: DataRegion
    page: number
    pageSize: number
    type?: string
    name?: string
    version?: string
    status?: string
}): Promise<DataListResult<Software>> => {
    const { region, page, pageSize, type, name, version, status } = params
    const { host, port } = getOtaConfig(region)

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
    if (!res.data.data) {
        console.error('request ota service failed: ', res.data)
        throw new Error('FAILED_LIST_SOFTWARE')
    }

    return {
        items: res.data.data.items,
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
    const { host, port } = getOtaConfig(region)

    let res
    try {
        res = await axios.get(`http://${host}:${port}/software/verions`, {
            params: { name },
        })
    } catch (error) {
        console.error('get software versions failed: ', error)
        throw error
    }
    if (!res.data.data) {
        console.error('request ota service failed: ', res.data)
        throw new Error('FAILED_GET_SOFTWARE_VERSIONS')
    }

    return res.data.data as string[]
}

/**
 * Get upload post handler.
 * @returns software id and S3 upload post
 */
export const getUploadPost_ = async (params: {
    region: DataRegion
    type: string
    name: string
    version: string
    dependencies: Record<string, string>
    changelog: string
    fileName: string
    mimeType: string
    sizeBytes: number
    checksum: string
}): Promise<SoftwareUploadPostResult> => {
    const { region, type, name, version, dependencies, changelog, fileName, mimeType, sizeBytes, checksum } = params
    const { host, port } = getOtaConfig(region)

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
    if (!res.data.data) {
        console.error('request ota service failed: ', res.data)
        throw new Error('FAILED_GET_UPLOAD_POST')
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
    const { host, port } = getOtaConfig(region)

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
