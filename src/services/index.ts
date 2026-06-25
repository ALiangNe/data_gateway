import { initMaxmindClient, disconnectMaxmindClient } from './maxmind'

/**
 * Initialize the services modules.
 */
export const initServicesModules = async () => {
    try {
        await initMaxmindClient()
    } catch (error) {
        console.error('Error initializing services modules:', error)
        throw error
    }
}

/**
 * Stop the services modules.
 */
export const stopServicesModules = async () => {
    try {
        disconnectMaxmindClient()
    } catch (error) {
        console.error('Error stopping services modules:', error)
        throw error
    }
}
