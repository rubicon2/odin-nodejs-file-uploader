function getUpload(req, res, next) {
  res.render('file/upload.ejs', { title: 'Upload file', user: req.user });
  // Clear route data.
  next();
}

async function postUpload(req, res, next) {
  try {
    console.log(req.file);
    console.log(req.body);
    res.redirect('/file/upload');
  } catch (error) {
    next(error);
  }
}

export { getUpload, postUpload };
