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

router.post('/getBots', roleCheck([1, 5]), _getBots)
router.post('/getKnowledge', roleCheck([1, 5]), _getKnowledge)
router.post('/getMcpCapabilities', roleCheck([1, 5]), _getMcpCapabilities)
router.post('/getMonitorLogsTrace', roleCheck([1, 5]), _getMonitorLogsTrace)
router.post('/getUsers', roleCheck([1, 5]), _getUsers)
router.post('/getUserBehaviorLogs', roleCheck([1, 5]), _getUserBehaviorLogs)
router.post('/getUserMemory', roleCheck([1, 5]), _getUserMemory)
router.post('/getChatActiveDates', roleCheck([1, 5]), _getChatActiveDates)
router.post('/getChatHistories', roleCheck([1, 5]), _getChatHistories)

export default router
