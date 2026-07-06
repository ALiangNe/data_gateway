import { Router } from 'express'
import { roleCheck } from '../../midwares/permission'
import {
    _getBots,
    _getChatActiveDates,
    _getChatHistories,
    _getDataLookup,
    _getKnowledge,
    _getMcpCapabilities,
    _getMonitorLogsTrace,
    _getUsers,
    _getUserBehaviorLogs,
    _getUserBehaviorStats,
    _getUserMemory,
} from './midware'

const router = Router()

router.post('/getBots', roleCheck([1, 5]), _getBots)
router.post('/getKnowledge', roleCheck([1, 5]), _getKnowledge)
router.post('/getMcpCapabilities', roleCheck([1, 5]), _getMcpCapabilities)
router.post('/getMonitorLogsTrace', roleCheck([1, 5]), _getMonitorLogsTrace)
router.post('/getUsers', roleCheck([1, 5]), _getUsers)
router.post('/getUserBehaviorLogs', roleCheck([1, 5]), _getUserBehaviorLogs)
router.post('/getUserBehaviorStats', roleCheck([1, 5]), _getUserBehaviorStats)
router.post('/getUserMemory', roleCheck([1, 5]), _getUserMemory)
router.post('/getChatActiveDates', roleCheck([1, 5]), _getChatActiveDates)
router.post('/getChatHistories', roleCheck([1, 5]), _getChatHistories)
router.post('/getDataLookup', roleCheck([1, 5]), _getDataLookup)

export default router
