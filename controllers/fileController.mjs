import prisma from '../db/prisma.mjs';

function getUpload(req, res, next) {
  res.render('file/upload.ejs', { title: 'Upload file', user: req.user });
  // Clear route data.
  next();
}

async function postUpload(req, res, next) {
  try {
    await prisma.file.create({
      data: {
        ownerId: req.user.id,
        folderId: req?.params?.folderId || null,
        url: req.file.path,
        name: req.file.originalname,
      },
    });
    res.redirect('/file/upload');
  } catch (error) {
    next(error);
  }
}

export { getUpload, postUpload };
