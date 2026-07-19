import { Router } from 'express'
import { roleCheck } from '../../midwares/permission'
import { _getBots } from './midware'

const router = Router()

router.get('/bots', roleCheck([0, 1, 2]), _getBots)

export default router
