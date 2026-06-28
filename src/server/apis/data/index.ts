import { Router } from 'express'
import { roleCheck } from '../../midwares/permission'
import {
    _getBots,
    _getKnowledge,
    _getMcpCapabilities,
    _getMonitorLogsTrace,
    _getUsers,
    _getUserBehaviorLogs,
    _getUserMemory,
    _getChatActiveDates,
    _getChatHistories,
} from './midware'

const router = Router()

router.post('/getBots', roleCheck([2, 5]), _getBots)
router.post('/getKnowledge', roleCheck([2]), _getKnowledge)
router.post('/getMcpCapabilities', roleCheck([2]), _getMcpCapabilities)
router.get('/getMonitorLogs/traces/:traceId', roleCheck([2]), _getMonitorLogsTrace)
router.post('/getUsers', roleCheck([2]), _getUsers)
router.post('/getUserBehaviorLogs', roleCheck([2]), _getUserBehaviorLogs)
router.post('/getUserMemory', roleCheck([2]), _getUserMemory)
router.post('/getChatActiveDates', roleCheck([2]), _getChatActiveDates)
router.post('/getChatHistories', roleCheck([2]), _getChatHistories)

export default router
