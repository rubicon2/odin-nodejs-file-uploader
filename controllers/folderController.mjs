import prisma from '../db/prisma.mjs';

async function getFolder(req, res, next) {
  try {
    const folder = await prisma.folder.findUnique({
      where: {
        id: parseInt(req.params.folderId),
      },
      include: {
        children: true,
      },
    });
    res.render('folder/folder', { title: folder.name, user: req.user, folder });
  } catch (error) {
    next(error);
  }
}

async function postNewFolder(req, res, next) {
  try {
    await prisma.folder.create({
      data: {
        name: req.body.name,
        ownerId: req.user.id,
        parentId: parseInt(req?.params?.folderId) || null,
      },
    });
    res.redirect('/');
  } catch (error) {
    next(error);
  }
}

async function postUpdateFolder(req, res, next) {
  try {
    await prisma.folder.update({
      where: {
        id: parseInt(req.params.folderId),
      },
      data: {
        name: req.body.name,
      },
    });
    res.redirect(`/folder/${req.params.folderId}`);
  } catch (error) {
    next(error);
  }
}

async function postDeleteFolder(req, res, next) {
  try {
    await prisma.folder.delete({
      where: {
        id: parseInt(req.params.folderId),
      },
    });
    res.redirect('/');
  } catch (error) {
    next(error);
  }
}

export { getFolder, postNewFolder, postUpdateFolder, postDeleteFolder };
