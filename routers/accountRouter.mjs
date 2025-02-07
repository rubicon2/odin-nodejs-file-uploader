import * as accountController from '../controllers/accountController.mjs';
import * as routeData from '../middleware/routeData.mjs';
import { Router } from 'express';
import passport from 'passport';

const router = Router();

router.get(
  '/log-in',
  routeData.storePassportErrors,
  accountController.getLogIn,
  routeData.clearRouteData,
);
router.post(
  '/log-in',
  routeData.storeFormData,
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/account/log-in',
    failureMessage: true,
  }),
);
router.post('/log-out', (req, res, next) => {
  req.logOut((error) => {
    if (error) return next(error);
    res.redirect('/');
  });
});

export default router;
