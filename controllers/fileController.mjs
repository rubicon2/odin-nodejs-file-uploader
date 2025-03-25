import prisma from '../db/prisma.mjs';

async function getFile(req, res, next) {
  try {
    const file = await prisma.file.findUnique({
      where: {
        id: req.params.fileId,
        ownerId: req.user.id,
      },
    });

    const parentFolder = !file.folderId
      ? null
      : await prisma.folder.findUnique({
          where: {
            id: file.folderId,
          },
        });

    if (!file) throw new Error('File not found');
    res.render('file/file', {
      title: file.name,
      user: req.user,
      file,
      parentFolder,
    });
  } catch (error) {
    next(error);
  }
}

async function getUpdateFile(req, res, next) {
  try {
    const formData = req.session?.formData;
    const file = await prisma.file.findUnique({
      where: {
        id: req.params.fileId,
        ownerId: req.user.id,
      },
      include: {
        folder: true,
      },
    });
    if (!file) throw new Error('File not found');
    res.render('file/update', {
      title: file.name,
      user: req.user,
      file,
      formData,
      errors: req.session.errors,
    });
  } catch (error) {
    return next(error);
  }
}

async function downloadFile(req, res, next) {
  try {
    const file = await prisma.file.findUnique({
      where: {
        id: req.params.fileId,
        ownerId: req.user.id,
      },
    });
    if (!file) throw new Error('File not found');
    const { url, name } = file;
    res.download(url, name);
  } catch (error) {
    next(error);
  }
}

async function postFile(req, res, next) {
  try {
    const folderId = req?.body?.folderId || null;
    const existingFile = await prisma.file.findFirst({
      where: {
        ownerId: req.user.id,
        folderId,
        name: req.file.originalname,
      },
    });

    // Cannot have 2 files with the same name in the same folder.
    if (existingFile) {
      throw new Error(
        'Cannot upload two files with the same name in the same folder',
      );
    }

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

async function renameFile(req, res, next) {
  try {
    const { fileId } = req.params;
    const { name } = req.body;
    // Make sure no file in this folder already has that name.
    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
      },
      include: {
        folder: true,
      },
    });
    const existingFileWithName = await prisma.file.findFirst({
      where: {
        AND: [
          {
            name,
          },
          {
            id: {
              not: fileId,
            },
          },
          {
            folderId: file.folderId,
          },
        ],
      },
    });

    if (existingFileWithName) {
      req.session.errors = {
        name: `A file with that name already exists in ${file.folder?.name || 'the root directory'}`,
      };
      return req.session.save((error) => {
        if (error) next(error);
        return res.redirect(`/file/${fileId}/update`);
      });
    }

    // Otherwise, we are ok to update to the new name.
    await prisma.file.update({
      where: {
        id: fileId,
      },
      data: {
        name,
      },
    });

    if (file.folderId) {
      res.redirect(`/folder/${file.folderId}`);
    } else {
      res.redirect('/');
    }
  } catch (error) {
    return next(error);
  }
}

async function deleteFile(req, res, next) {
  try {
    const file = await prisma.file.delete({
      where: {
        id: req.params.fileId,
      },
    });
    if (file.folderId) {
      res.redirect(`/folder/${file.folderId}`);
    } else {
      res.redirect('/');
    }
  } catch (error) {
    return next(error);
  }
}

export {
  getFile,
  getUpdateFile,
  downloadFile,
  postFile,
  renameFile,
  deleteFile,
};
