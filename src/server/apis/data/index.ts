import { Router } from 'express'
import {
    _getBots,
    _getKnowledge,
    _getMcpCapabilities,
    _getMonitorLogsTrace,
    _getMonitorLogsTraces,
    _getUsers,
    _getUserBehaviorLogs,
    _getUserMemory,
    _getChatActiveDates,
    _getChatHistories,
} from './midware'

const router = Router()

router.post('/getBots', _getBots)
router.post('/getKnowledge', _getKnowledge)
router.post('/getMcpCapabilities', _getMcpCapabilities)
router.get('/getMonitorLogs/traces', _getMonitorLogsTraces)
router.get('/getMonitorLogs/traces/:traceId', _getMonitorLogsTrace)
router.post('/getUsers', _getUsers)
router.post('/getUserBehaviorLogs', _getUserBehaviorLogs)
router.post('/getUserMemory', _getUserMemory)
router.post('/getChatActiveDates', _getChatActiveDates)
router.post('/getChatHistories', _getChatHistories)

export default router
