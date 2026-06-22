import { Router } from 'express'
import {
    _getBots,
    _getKnowledge,
    _getMcpCapabilities,
    _getMonitorLogs,
    _getUsers,
    _getUserBehaviorLogs,
    _getUserMemoriesByUserId,
    _getChatActiveDates,
    _getChatHistoriesByDate,
} from './midware'

const router = Router()

router.post('/getBots', _getBots)
router.post('/getKnowledge', _getKnowledge)
router.post('/getMcpCapabilities', _getMcpCapabilities)
router.post('/getMonitorLogs', _getMonitorLogs)
router.post('/getUsers', _getUsers)
router.post('/getUserBehaviorLogs', _getUserBehaviorLogs)
router.post('/getUserMemoriesByUserId', _getUserMemoriesByUserId)
router.post('/getChatActiveDates', _getChatActiveDates)
router.post('/getChatHistoriesByDate', _getChatHistoriesByDate)

export default router
