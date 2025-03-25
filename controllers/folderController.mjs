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
        children: {
          orderBy: {
            name: 'asc',
          },
        },
        files: {
          orderBy: {
            name: 'asc',
          },
        },
      },
    });
    if (!folder) throw new Error('Folder not found');
    res.render('folder/folder', {
      title: folder.name,
      user: req.user,
      isRoot: false,
      folder,
    });
  } catch (error) {
    next(error);
  }
}

async function getUpdateFolder(req, res, next) {
  try {
    const formData = req.session?.formData;
    const folder = await prisma.folder.findUnique({
      where: {
        id: req.params.folderId,
        ownerId: req.user.id,
      },
      include: {
        parent: true,
      },
    });
    if (!folder) throw new Error('Folder not found');
    res.render('folder/update', {
      title: folder.name,
      user: req.user,
      folder,
      formData,
      errors: req.session?.errors,
    });
  } catch (error) {
    return next(error);
  }
}

async function postNewFolder(req, res, next) {
  try {
    let name = req?.body?.name || 'New Folder';
    const ownerId = req.user.id;
    const parentId = req?.params?.folderId || null;

    // Check this name has not already been used by an existing folder.
    const existingFolderWithName = await prisma.folder.findFirst({
      where: {
        name,
        ownerId,
        parentId,
      },
    });

    if (existingFolderWithName)
      throw new Error('A folder with that name already exists');

    // If that name has not already been taken, create the new folder.
    await prisma.folder.create({
      data: {
        name,
        ownerId,
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
    const { folderId } = req.params;
    const { name } = req.body;

    const folder = await prisma.folder.findUnique({
      where: {
        id: folderId,
      },
      include: {
        parent: true,
      },
    });

    // Stop renaming a folder to one that already exists in the parent folder.
    const existingFolderWithName = await prisma.folder.findFirst({
      where: {
        parentId: folder.parentId,
        name,
      },
    });

    if (existingFolderWithName) {
      req.session.errors = {
        name: `A folder with that name already exists in ${folder.parent?.name || 'the root directory'}`,
      };
      return req.session.save((error) => {
        if (error) next(error);
        return res.redirect(`/folder/${folderId}/update`);
      });
    }

    await prisma.folder.update({
      where: {
        id: req.params.folderId,
      },
      data: {
        name: req.body.name,
      },
    });

    if (folder.parentId) res.redirect(`/folder/${folder.parentId}`);
    else res.redirect('/');
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

export {
  getFolder,
  getUpdateFolder,
  postNewFolder,
  postUpdateFolder,
  postDeleteFolder,
};
