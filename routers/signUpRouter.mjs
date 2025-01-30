import * as signUpController from '../controllers/signUpController.mjs';
import { Router } from 'express';

const router = Router();

router.get('/', signUpController.getSignUp);

export default router;
