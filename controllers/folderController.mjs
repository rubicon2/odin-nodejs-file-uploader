import prisma from '../db/prisma.mjs';

async function getFolder(req, res, next) {
  res.send('Some folder');
}

async function postNewFolder(req, res, next) {
  try {
    await prisma.folder.create({
      data: {
        name: req.body.name,
        ownerId: req.user.id,
        parentId: req?.params?.folderId || null,
      },
    });
    res.redirect('/');
  } catch (error) {
    next(error);
  }
}

export { getFolder, postNewFolder };
