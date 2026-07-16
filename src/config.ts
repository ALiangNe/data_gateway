/**
 * Basic environment variables required by API gateway.
 */
import { resolve } from 'node:path'

// Public document directory (keep static file capability)
export const DOCUMENT_PATH = resolve(__dirname, '..', 'public')
if (!process.env.SERVICE_NAME) {
    throw new Error('SERVICE_NAME is not set')
}
export const SERVICE_NAME = process.env.SERVICE_NAME
export const NODE_ENV = process.env.NODE_ENV || 'dev'

// IP whitelist
export const IP_WHITELIST = process.env.IP_WHITELIST ? process.env.IP_WHITELIST.trim().split(',') : []

// HTTP port
export const HTTP_PORT = Number(process.env.HTTP_PORT)
export const CORS_ORIGINS = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.trim().split(',') : []

// AUTH CENTER (for fetching JWT public key)
export const AUTH_HOST = process.env.AUTH_HOST
export const AUTH_PORT = process.env.AUTH_PORT

// OTA service
export const OTA_USW1_HOST = process.env.OTA_USW1_HOST || ''
export const OTA_USW1_PORT = process.env.OTA_USW1_PORT || ''
export const OTA_EUC1_HOST = process.env.OTA_EUC1_HOST || ''
export const OTA_EUC1_PORT = process.env.OTA_EUC1_PORT || ''

// Redis configuration
export const REDIS_HOSTS = process.env.REDIS_HOSTS ? process.env.REDIS_HOSTS.trim().split(',') : []
export const REDIS_PORT = Number(process.env.REDIS_PORT)
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? ''
export const REDIS_USE_CLUSTER = process.env.REDIS_USE_CLUSTER === 'true'
export const REDIS_USE_TLS = process.env.REDIS_USE_TLS === 'true'
export const REDIS_STREAM_READ_COUNT = Number(process.env.REDIS_STREAM_READ_COUNT) || 10
// Redis Stream Config
export const REDIS_STREAMS_LISTEN = process.env.REDIS_STREAMS_LISTEN ? process.env.REDIS_STREAMS_LISTEN.split(',') : []

// PostgreSQL configuration
export const PG_USW1_HOST = process.env.PG_USW1_HOST || ''
export const PG_USW1_PORT = Number(process.env.PG_USW1_PORT || '')
export const PG_USW1_USERNAME = process.env.PG_USW1_USERNAME || ''
export const PG_USW1_PASSWORD = process.env.PG_USW1_PASSWORD || ''
export const PG_USW1_DATABASE = process.env.PG_USW1_DATABASE || ''
export const PG_USW1_MAX_CONNECTIONS = Number(process.env.PG_USW1_MAX_CONNECTIONS || 10)
export const PG_USW1_USE_TLS = process.env.PG_USW1_USE_TLS === 'true'
export const PG_EUC1_HOST = process.env.PG_EUC1_HOST || ''
export const PG_EUC1_PORT = Number(process.env.PG_EUC1_PORT || '')
export const PG_EUC1_USERNAME = process.env.PG_EUC1_USERNAME || ''
export const PG_EUC1_PASSWORD = process.env.PG_EUC1_PASSWORD || ''
export const PG_EUC1_DATABASE = process.env.PG_EUC1_DATABASE || ''
export const PG_EUC1_MAX_CONNECTIONS = Number(process.env.PG_EUC1_MAX_CONNECTIONS || 10)
export const PG_EUC1_USE_TLS = process.env.PG_EUC1_USE_TLS === 'true'

// Platform list
export const PLATFORM_LIST = process.env.PLATFORM_LIST ? process.env.PLATFORM_LIST.split(',') : []
