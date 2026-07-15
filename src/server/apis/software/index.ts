import { Router } from 'express'
import { roleCheck } from '../../midwares/permission'
import { _completeUpload, _getUploadPost, _listSoftware, _getSoftwareVersions } from './midware'

const router = Router()

router.get('/list', roleCheck([0, 1, 2]), _listSoftware)
router.get('/versions', roleCheck([0, 1, 2]), _getSoftwareVersions)
router.post('/upload-post', roleCheck([0, 1, 2]), _getUploadPost)
router.post('/complete-upload', roleCheck([0, 1, 2]), _completeUpload)

export default router
