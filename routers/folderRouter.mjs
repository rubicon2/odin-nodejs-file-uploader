import * as folderController from '../controllers/folderController.mjs';
import * as routeData from '../middleware/routeData.mjs';
import { isAuth } from '../middleware/auth.mjs';
import { Router } from 'express';

const router = Router();

router.get('/:folderId', isAuth, folderController.getFolder);
router.get('/:folderId/update', isAuth, folderController.getUpdateFolder);

router.post('/new', isAuth, folderController.postNewFolder);
router.post('/:folderId/new', isAuth, folderController.postNewFolder);
router.post('/:folderId/update', isAuth, folderController.postUpdateFolder);
router.post('/:folderId/delete', isAuth, folderController.postDeleteFolder);

export default router;
