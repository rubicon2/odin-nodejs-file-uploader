import prisma from '../db/prisma.mjs';

async function postUpload(req, res, next) {
  try {
    const folderId = req?.body?.folderId || null;
    await prisma.file.create({
      data: {
        ownerId: req.user.id,
        folderId,
        url: req.file.path,
        name: req.file.originalname,
      },
    });
    if (folderId) res.redirect(`/folder/${folderId}`);
    else res.redirect('/');
  } catch (error) {
    next(error);
  }
}

export { postUpload };
