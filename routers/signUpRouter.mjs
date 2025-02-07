import * as signUpController from '../controllers/signUpController.mjs';
import * as routeData from '../middleware/routeData.mjs';
import { Router } from 'express';

const router = Router();

router.get('/', signUpController.getSignUp, routeData.clearRouteData);
router.post('/', routeData.storeFormData, signUpController.postSignUp);
router.get('/success', signUpController.getSuccess, routeData.clearRouteData);

export default router;
