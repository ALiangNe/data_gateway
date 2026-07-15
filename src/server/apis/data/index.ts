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
    _updateUserPermission,
} from './midware'

const router = Router()

router.post('/getBots', roleCheck([0, 1, 2]), _getBots)
router.post('/getKnowledge', roleCheck([0, 1, 3]), _getKnowledge)
router.post('/getMcpCapabilities', roleCheck([0, 1]), _getMcpCapabilities)
router.post('/getMonitorLogsTrace', roleCheck([0, 1]), _getMonitorLogsTrace)
router.post('/getUsers', roleCheck([0, 1, 2, 3]), _getUsers)
router.post('/getUserBehaviorLogs', roleCheck([0, 1, 3]), _getUserBehaviorLogs)
router.post('/getUserBehaviorStats', roleCheck([0, 1, 2, 3]), _getUserBehaviorStats)
router.post('/getUserMemory', roleCheck([0, 1, 3]), _getUserMemory)
router.post('/getChatActiveDates', roleCheck([0, 1, 3]), _getChatActiveDates)
router.post('/getChatHistories', roleCheck([0, 1, 3]), _getChatHistories)
router.post('/getDataLookup', roleCheck([0, 1]), _getDataLookup)
router.post('/updateUserPermission', roleCheck([0, 1]), _updateUserPermission)

export default router
