function storeFormData(req, res, next) {
  req.session.formData = { ...req.body };
  next();
}

function storePassportErrors(req, res, next) {
  if (!req.session.messages) req.session.messages = [];

  // Each message is a JSON string as passport only allows strings, not objects - turn back into objects.
  const array = req.session.messages.map((message) => JSON.parse(message));
  const obj = array.reduce((obj, current) => {
    return {
      ...obj,
      [current.path]: current.msg,
    };
  }, {});

  // Store as obj with form paths so can map errors to offending inputs, but also array for convenience, e.g. making a list.
  req.session.errors = { ...obj, array };
  delete req.session.messages;
  next();
}

function clearRouteData(req, res, next) {
  delete req.session.formData;
  delete req.session.errors;
  req.session.save((error) => {
    if (error) next(error);
    // Clear route data should come after the response has been sent and the last in the middleware chain.
    res.end();
  });
}

export { storeFormData, storePassportErrors, clearRouteData };
