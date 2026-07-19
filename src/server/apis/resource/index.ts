import { Router } from 'express'
import { roleCheck } from '../../midwares/permission'
import { _getKnowledge, _getMcpCapabilities } from './midware'

const router = Router()

router.get('/knowledge', roleCheck([0, 1, 3]), _getKnowledge)
router.get('/mcp-capabilities', roleCheck([0, 1]), _getMcpCapabilities)

export default router
