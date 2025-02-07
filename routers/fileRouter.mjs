import * as fileController from '../controllers/fileController.mjs';
import * as routeData from '../middleware/routeData.mjs';
import { isAuth } from '../middleware/auth.mjs';
import { Router } from 'express';
import multer from 'multer';

const router = Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, done) => {
      done(null, 'uploads/');
    },
    filename: (req, file, done) => {
      const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      // How to get file extension without messing with file names that have dots in?
      // This name is just for storage. The name the user sees will be stored on the db with this url.
      done(null, uniquePrefix + '-' + file.originalname);
    },
  }),
});

router.post(
  '/upload',
  isAuth,
  routeData.storeFormData,
  upload.single('file'),
  fileController.postUpload,
);

export default router;
