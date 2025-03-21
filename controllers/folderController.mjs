import prisma from '../db/prisma.mjs';

async function getFolder(req, res, next) {
  try {
    const folder = await prisma.folder.findUnique({
      where: {
        id: req.params.folderId,
        ownerId: req.user.id,
      },
      include: {
        parent: true,
        children: true,
        files: true,
      },
    });
    if (!folder) throw new Error('Folder not found');
    res.render('folder/folder', { title: folder.name, user: req.user, folder });
  } catch (error) {
    next(error);
  }
}

async function postNewFolder(req, res, next) {
  try {
    const parentId = req?.params?.folderId || null;
    await prisma.folder.create({
      data: {
        name: req.body.name,
        ownerId: req.user.id,
        parentId,
      },
    });
    if (parentId) {
      res.redirect(`/folder/${parentId}`);
    } else {
      res.redirect('/');
    }
  } catch (error) {
    next(error);
  }
}

async function postUpdateFolder(req, res, next) {
  try {
    await prisma.folder.update({
      where: {
        id: req.params.folderId,
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
    // Redirect to parent folder if there is one.
    const { parent } = await prisma.folder.findUnique({
      where: {
        id: req.params.folderId,
      },
      include: {
        parent: true,
      },
    });

    await prisma.folder.delete({
      where: {
        id: req.params.folderId,
      },
    });

    if (parent) res.redirect(`/folder/${parent.id}`);
    else res.redirect('/');
  } catch (error) {
    next(error);
  }
}

export { getFolder, postNewFolder, postUpdateFolder, postDeleteFolder };
