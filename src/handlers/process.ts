/**
 * Application level (Process Level) Handlers
 */
import {
    SERVICE_NAME,
    initHTTPServer,
    initJwtModules,
    stopHTTPServer,
    initRedisModules,
    initPostgresModules,
    stopPostgresModules,
    stopRedisModules,
} from '../init'

/**
 * Custom process event handler: SIG_START
 * Handles service startup signal
 * @param e signal name
 */
export const SIGSTART_HANDLER = async (e: string) => {
    console.log(`-------- ${new Date()} --------\n         SIGNAL: ${e}\n${SERVICE_NAME} initialisation STARTED`)

    try {
        await initJwtModules()
        await initRedisModules()
        await initPostgresModules()
        initHTTPServer()
        console.log(`-------- ${new Date()} --------\n         ${SERVICE_NAME} initialisation ready!\n         Waiting for HTTP server...\n`)
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

/**
 * SIGINT/SIGTERM handler
 * Handles graceful shutdown signal
 * @param e signal event
 */
export const SIGINTTERM_HANDLER = async (e: unknown) => {
    console.log(`\n\n\n${new Date(Date.now())}\ne: ${e}\ngracefully shutting down ...`)
    process.env.DID_MANUALLY_SHUTDOWN = 'yes'

    try {
        await stopHTTPServer()
        await stopRedisModules()
        await stopPostgresModules()
    } catch (err) {
        console.log(`The shutdown is not so graceful, ${err}`)
    }

    console.log('BYE')
    process.exit(0)
}

/**
 * Uncaught exception handler
 * @param e exception object
 */
export const UNCAUGHTEXCEPTION_HANDLER = async (e: unknown) => {
    console.error(`\n${new Date(Date.now())}\nUNCAUGHTEXCEPTION_HANDLER: ${e}`)
    process.exit(1)
}
