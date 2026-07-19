import { Router } from 'express'
import { roleCheck } from '../../midwares/permission'
import { _getChatActiveDates, _getChatHistories } from './midware'

const router = Router()

router.get('/active-dates', roleCheck([0, 1, 3]), _getChatActiveDates)
router.get('/histories', roleCheck([0, 1, 3]), _getChatHistories)

export default router
