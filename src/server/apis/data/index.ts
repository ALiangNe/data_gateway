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

router.get('/getBots', roleCheck([0, 1, 2]), _getBots)
router.get('/getKnowledge', roleCheck([0, 1, 3]), _getKnowledge)
router.get('/getMcpCapabilities', roleCheck([0, 1]), _getMcpCapabilities)
router.get('/getMonitorLogsTrace', roleCheck([0, 1]), _getMonitorLogsTrace)
router.get('/getUsers', roleCheck([0, 1, 2, 3]), _getUsers)
router.get('/getUserBehaviorLogs', roleCheck([0, 1, 3]), _getUserBehaviorLogs)
router.get('/getUserBehaviorStats', roleCheck([0, 1, 2, 3]), _getUserBehaviorStats)
router.get('/getUserMemory', roleCheck([0, 1, 3]), _getUserMemory)
router.get('/getChatActiveDates', roleCheck([0, 1, 3]), _getChatActiveDates)
router.get('/getChatHistories', roleCheck([0, 1, 3]), _getChatHistories)
router.get('/getDataLookup', roleCheck([0, 1]), _getDataLookup)
router.post('/updateUserPermission', roleCheck([0, 1]), _updateUserPermission)

export default router
