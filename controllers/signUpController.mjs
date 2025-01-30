function getSignUp(req, res, next) {
  res.render('sign-up/sign-up', { title: 'Sign Up' });
  next();
}

export { getSignUp };
