import prisma from '../db/prisma.mjs';
import { getAllFilesRecursive } from '../db/prismaRaw.mjs';
import { deletePublicFile } from '../db/supabase.mjs';

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
    // Clear route data once the response has been sent.
    res.on('finish', next);
  } catch (error) {
    next(error);
  }
}

async function getUpdateFolder(req, res, next) {
  try {
    const formData = req.session?.formData;
    const errors = req.session?.errors;

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
      errors,
    });
    // Only clear the routeData once the response has been sent.
    res.on('finish', next);
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
        id: {
          not: folderId,
        },
        parentId: folder.parentId,
        name,
      },
    });

    if (existingFolderWithName) {
      req.session.errors = {
        name: `A folder with that name already exists in ${folder.parent?.name || 'the root directory'}`,
      };
    } else {
      // Upon success, we will not redirect to folder/update route which clears the formData, so do it now.
      delete req.session.errors;
      delete req.session.formData;
      await prisma.folder.update({
        where: {
          id: req.params.folderId,
        },
        data: {
          name: req.body.name,
        },
      });
    }

    req.session.save((error) => {
      if (error) return next(error);
      if (existingFolderWithName)
        return res.redirect(`/folder/${folderId}/update`);
      if (folder.parentId) return res.redirect(`/folder/${folder.parentId}`);
      return res.redirect('/');
    });
  } catch (error) {
    next(error);
  }
}

async function postDeleteFolder(req, res, next) {
  try {
    // Get parent if there is one, so we can redirect to it after folder and contents deleted.
    const { parent } = await prisma.folder.findUnique({
      where: {
        id: req.params.folderId,
      },
      include: {
        parent: true,
      },
    });

    // Get all files within folder and within any child folders.
    const allFiles = await getAllFilesRecursive(req.params.folderId);
    // Must remove cdn files before deleting the folder, which deletes all child folders and file entries from the db.
    await Promise.all(allFiles.map((file) => deletePublicFile(file.url)));

    // As folderId is a self-relation to the folder table, and is
    // onDelete: Cascade, all the child folders and files will be removed automatically.
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
