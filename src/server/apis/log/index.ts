import { Router } from 'express'
import { roleCheck } from '../../midwares/permission'
import { _getMonitorLogsTrace } from './midware'

const router = Router()

router.get('/monitor-trace', roleCheck([0, 1]), _getMonitorLogsTrace)

export default router
