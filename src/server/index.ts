/**
 * Pure gateway: exposes a unified reverse proxy and forwards requests to downstream services.
 */
import type { Server } from 'node:http'
export type { Server }
import cors from 'cors'
import express from 'express'
import { ipCheck, logRequest, tokenCheck } from './midwares/auth'
import { errorHandler } from './midwares/error'
import { rateLimiteCheck } from './midwares/security'
import healthRoute from './apis/health'
import dataRoute from './apis/data'
import softwareRoute from './apis/software'
import { CORS_ORIGINS, NODE_ENV } from '../config'
// Expose listener instance to higher level scripts
const listener = express()

listener.disable('x-powered-by')

listener.use(express.json())

// CORS
listener.use(cors({ origin: CORS_ORIGINS, credentials: NODE_ENV !== 'dev' }))

// Request logging
listener.use(logRequest)

// IP whitelist (strictly enforced in non-dev environments)
listener.use(ipCheck)

// load APIs (routes to business logc)
listener.use('/', healthRoute)
listener.use('/data', rateLimiteCheck, tokenCheck, dataRoute)
listener.use('/software', rateLimiteCheck, tokenCheck, softwareRoute)
listener.use(errorHandler)

export const startHTTPServer = (HTTP_PORT: number): Server => {
    let server: Server | undefined
    try {
        server = listener.listen(HTTP_PORT, '0.0.0.0', () => { console.log('HTTP Server listening at port ' + HTTP_PORT) })
        // server = listener.listen(HTTP_PORT, '10.100.0.1', () => { console.log('HTTP Server listening at port ' + HTTP_PORT) })
        // server = listener.listen(HTTP_PORT, '10.100.1.1', () => { console.log('HTTP Server listening at port ' + HTTP_PORT) })
    } catch (e) {
        console.error('Error when starting HTTP server: ', e)
        process.emit('SIGINT')
    }
    if (!server) {
        console.error('Failed to start HTTP server')
        process.emit('SIGINT')
    }

    server!.on('error', (err: NodeJS.ErrnoException) => {
        console.error('HTTP Server error: ', err)
        process.emit('SIGINT')
    })

    return server!
}
