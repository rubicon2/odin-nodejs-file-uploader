import * as folderController from '../controllers/folderController.mjs';
import * as routeData from '../middleware/routeData.mjs';
import { isAuth } from '../middleware/auth.mjs';
import { Router } from 'express';

const router = Router();

router.post('/new', isAuth, folderController.postNewFolder);
router.get('/:folderId', isAuth, folderController.getFolder);
router.post('/:folderId/new', isAuth, folderController.postNewFolder);

export default router;
