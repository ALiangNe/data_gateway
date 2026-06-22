import { Router } from 'express'
import {
    _getAuthProviders,
    _getBots,
    _getChatHistories,
    _getChatTopics,
    _getKnowledge,
    _getMcpCapabilities,
    _getMedia,
    _getMonitorLogs,
    _getUsers,
    _getUserBehaviorLogs,
    _getUserMemories,
    _getUserMemoriesByUserId,
    _getChatActiveDates,
    _getChatHistoriesByDate,
} from './midware'

const router = Router()

router.post('/getAuthProviders', _getAuthProviders)
router.post('/getBots', _getBots)
router.post('/getChatHistories', _getChatHistories)
router.post('/getChatTopics', _getChatTopics)
router.post('/getKnowledge', _getKnowledge)
router.post('/getMcpCapabilities', _getMcpCapabilities)
router.post('/getMedia', _getMedia)
router.post('/getMonitorLogs', _getMonitorLogs)
router.post('/getUsers', _getUsers)
router.post('/getUserBehaviorLogs', _getUserBehaviorLogs)
router.post('/getUserMemories', _getUserMemories)
router.post('/getUserMemoriesByUserId', _getUserMemoriesByUserId)
router.post('/getChatActiveDates', _getChatActiveDates)
router.post('/getChatHistoriesByDate', _getChatHistoriesByDate)

export default router
