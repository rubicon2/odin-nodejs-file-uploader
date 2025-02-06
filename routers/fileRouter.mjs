import * as fileController from '../controllers/fileController.mjs';
import { isAuth } from '../middleware/auth.mjs';
import { Router } from 'express';

const router = Router();

router.get('/upload', isAuth, fileController.getUpload);

export default router;
