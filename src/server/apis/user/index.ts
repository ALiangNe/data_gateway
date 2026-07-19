import { Router } from 'express'
import { roleCheck } from '../../midwares/permission'
import {
    _getUserBehaviorLogs,
    _getUserBehaviorStats,
    _getUserMemory,
    _getUsers,
    _updateUserPermission,
} from './midware'

const router = Router()

router.get('/list', roleCheck([0, 1, 2, 3]), _getUsers)
router.post('/permission', roleCheck([0, 1]), _updateUserPermission)
router.get('/behavior-logs', roleCheck([0, 1, 3]), _getUserBehaviorLogs)
router.get('/behavior-stats', roleCheck([0, 1, 2, 3]), _getUserBehaviorStats)
router.get('/memory', roleCheck([0, 1, 3]), _getUserMemory)

export default router
