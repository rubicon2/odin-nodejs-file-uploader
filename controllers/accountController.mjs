function getLogIn(req, res, next) {
  res.render('account/log-in', {
    title: 'Log In',
    formData: req.session.formData,
    errors: req.session.errors,
  });
  // For clearing route data like formData and errors, after loaded into view.
  res.on('finish', next);
}

export { getLogIn };
