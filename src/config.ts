/**
 * Environment variables for the data query service.
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
export const OTA_HOST_USW1 = process.env.OTA_HOST_USW1 || ''
export const OTA_PORT_USW1 = process.env.OTA_PORT_USW1 || ''
export const OTA_HOST_EUC1 = process.env.OTA_HOST_EUC1 || ''
export const OTA_PORT_EUC1 = process.env.OTA_PORT_EUC1 || ''

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
export const PG_HOST_USW1 = process.env.PG_HOST_USW1 || ''
export const PG_PORT_USW1 = Number(process.env.PG_PORT_USW1 || '')
export const PG_USERNAME_USW1 = process.env.PG_USERNAME_USW1 || ''
export const PG_PASSWORD_USW1 = process.env.PG_PASSWORD_USW1 || ''
export const PG_DATABASE_USW1 = process.env.PG_DATABASE_USW1 || ''
export const PG_MAX_CONNECTIONS_USW1 = Number(process.env.PG_MAX_CONNECTIONS_USW1 || 10)
export const PG_USE_TLS_USW1 = process.env.PG_USE_TLS_USW1 === 'true'

export const PG_HOST_EUC1 = process.env.PG_HOST_EUC1 || ''
export const PG_PORT_EUC1 = Number(process.env.PG_PORT_EUC1 || '')
export const PG_USERNAME_EUC1 = process.env.PG_USERNAME_EUC1 || ''
export const PG_PASSWORD_EUC1 = process.env.PG_PASSWORD_EUC1 || ''
export const PG_DATABASE_EUC1 = process.env.PG_DATABASE_EUC1 || ''
export const PG_MAX_CONNECTIONS_EUC1 = Number(process.env.PG_MAX_CONNECTIONS_EUC1 || 10)
export const PG_USE_TLS_EUC1 = process.env.PG_USE_TLS_EUC1 === 'true'

// Platform list
export const PLATFORM_LIST = process.env.PLATFORM_LIST ? process.env.PLATFORM_LIST.split(',') : []
