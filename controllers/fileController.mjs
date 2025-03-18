import prisma from '../db/prisma.mjs';

async function getFile(req, res, next) {
  try {
    const file = await prisma.file.findUnique({
      where: {
        id: req.params.id,
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

async function downloadFile(req, res, next) {
  try {
    const file = await prisma.file.findUnique({
      where: {
        id: req.params.id,
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
        ],
      },
    });

    if (existingFileWithName) {
      throw new Error('A file with that name already exists in this folder');
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
    res.redirect(`/file/${fileId}`);
  } catch (error) {
    return next(error);
  }
}

export { getFile, downloadFile, postFile, renameFile };
