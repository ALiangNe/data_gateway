/**
 * HTTP server for internal data query APIs.
 */
import type { Server } from 'node:http'
export type { Server }
import cors from 'cors'
import express from 'express'
import { ipCheck, logRequest, tokenCheck } from './midwares/auth'
import { errorHandler } from './midwares/error'
import { rateLimiteCheck } from './midwares/security'
import healthRoute from './apis/health'
import chatRoute from './apis/chat'
import commonRoute from './apis/common'
import hardwareRoute from './apis/hardware'
import logRoute from './apis/log'
import resourceRoute from './apis/resource'
import softwareRoute from './apis/software'
import userRoute from './apis/user'
import { CORS_ORIGINS, NODE_ENV } from '../config'
const listener = express()

listener.disable('x-powered-by')

listener.use(express.json())

// CORS
listener.use(cors({ origin: CORS_ORIGINS, credentials: NODE_ENV !== 'dev' }))

// Request logging
listener.use(logRequest)

// IP whitelist (strictly enforced in non-dev environments)
listener.use(ipCheck)

// Load APIs by feature.
listener.use('/', healthRoute)
listener.use('/chat', rateLimiteCheck, tokenCheck, chatRoute)
listener.use('/common', rateLimiteCheck, tokenCheck, commonRoute)
listener.use('/hardware', rateLimiteCheck, tokenCheck, hardwareRoute)
listener.use('/log', rateLimiteCheck, tokenCheck, logRoute)
listener.use('/resource', rateLimiteCheck, tokenCheck, resourceRoute)
listener.use('/software', rateLimiteCheck, tokenCheck, softwareRoute)
listener.use('/user', rateLimiteCheck, tokenCheck, userRoute)
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
