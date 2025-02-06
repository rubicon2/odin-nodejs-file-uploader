function getUpload(req, res) {
  res.render('file/upload.ejs', { title: 'Upload file', user: req.user });
}

export { getUpload };
