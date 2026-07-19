import { Router } from 'express'
import { roleCheck } from '../../midwares/permission'
import { _getDataLookup } from './midware'

const router = Router()

router.get('/data-lookup', roleCheck([0, 1]), _getDataLookup)

export default router
