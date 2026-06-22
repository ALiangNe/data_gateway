/**
 * Just another boring web service
 * By JohnJiang, Oct 2024
 *
 * This service emits following process level events in related condition:
 * - servicechange: { pid: process.pid, status: 'imperfect_shutdown' | 'gracefully_shutdown' | 'service_ready' }
 * - servicealert: { pid: process.pid, status: 'uncaught_exception' }
 *
 */
import { SIGSTART_HANDLER, SIGINTTERM_HANDLER, UNCAUGHTEXCEPTION_HANDLER } from './handlers/process'


process.on('SIGSTART', SIGSTART_HANDLER)
process.on('SIGINT', SIGINTTERM_HANDLER)
process.on('SIGTERM', SIGINTTERM_HANDLER)
process.on('uncaughtException', UNCAUGHTEXCEPTION_HANDLER)

process.emit('SIGSTART', 'APP START')
