import prisma from '../db/prisma.mjs';

async function getUpload(req, res, next) {
  try {
    const file = await prisma.file.findUnique({
      where: {
        id: req.params.id,
        ownerId: req.user.id,
      },
    });
    if (!file) throw new Error('File not found');
    res.render('file/file', { title: file.name, user: req.user, file });
  } catch (error) {
    next(error);
  }
}

// These are ambiguously named, think of better names.
async function getDownload(req, res, next) {
  try {
    const { url, name } = await prisma.file.findUnique({
      where: {
        id: req.params.id,
        ownerId: req.user.id,
      },
    });
    if (!url) throw new Error('File not found');
    res.download(url, name);
  } catch (error) {
    next(error);
  }
}

async function postUpload(req, res, next) {
  try {
    const folderId = req?.body?.folderId || null;
    await prisma.file.create({
      data: {
        ownerId: req.user.id,
        folderId,
        url: req.file.path,
        name: req.file.originalname,
        size: req.file.size,
      },
    });
    if (folderId) res.redirect(`/folder/${folderId}`);
    else res.redirect('/');
  } catch (error) {
    next(error);
  }
}

export { getUpload, getDownload, postUpload };
