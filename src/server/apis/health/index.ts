import { Router } from 'express'
import { _health, _ready } from './midware'

const router = Router()

router.get('/health', _health)
router.get('/ready', _ready)

export default router
