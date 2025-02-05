import * as logInController from '../controllers/logInController.mjs';
import * as routeData from '../middleware/routeData.mjs';
import { Router } from 'express';
import passport from 'passport';

const router = Router();

router.get(
  '/',
  routeData.storePassportErrors,
  logInController.getLogIn,
  routeData.clearRouteData,
);
router.post(
  '/',
  routeData.storeFormData,
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/log-in',
    failureMessage: true,
  }),
);

export default router;
