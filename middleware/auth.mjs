function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    next(new Error('You are not logged in'));
  }
}

export { isAuth };
