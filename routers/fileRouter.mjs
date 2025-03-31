import * as fileController from '../controllers/fileController.mjs';
import * as routeData from '../middleware/routeData.mjs';
import { isAuth } from '../middleware/auth.mjs';
import { Router } from 'express';
import multer from 'multer';

const router = Router();
const upload = multer({
  // Use memory storage to hold buffer of file to be passed off to CDN.
  storage: multer.memoryStorage(),
});

router.get('/:fileId', isAuth, fileController.getFile);
router.get(
  '/:fileId/update',
  isAuth,
  fileController.getUpdateFile,
  routeData.clearRouteData,
);
router.get('/:fileId/download', isAuth, fileController.downloadFile);
router.post(
  '/upload',
  isAuth,
  routeData.storeFormData,
  upload.single('file'),
  fileController.postFile,
);
router.post(
  '/:fileId/update',
  isAuth,
  routeData.storeFormData,
  fileController.renameFile,
);
router.post('/:fileId/delete', isAuth, fileController.deleteFile);

export default router;
