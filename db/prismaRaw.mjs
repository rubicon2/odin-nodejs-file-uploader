import prisma from './prisma.mjs';

async function getAllFilesRecursive(folderId) {
  const allFiles = await prisma.$queryRaw`
      WITH RECURSIVE all_child_folders(id) AS (
          SELECT f."id", f."parentId" FROM "Folder" f
          WHERE f."id" = ${folderId}
        UNION
          SELECT f."id", f."parentId"
          FROM "Folder" f, all_child_folders acf
          WHERE f."parentId" = acf."id"
      )
      SELECT * FROM "File" f
      WHERE f."folderId" IN (
        SELECT acf."id" FROM all_child_folders acf
      );
      `;
  return allFiles;
}

async function getAllFoldersRecursive(folderId) {
  const allFiles = await prisma.$queryRaw`
      WITH RECURSIVE all_child_folders(id) AS (
          SELECT f."id", f."parentId" FROM "Folder" f
          WHERE f."id" = ${folderId}
        UNION
          SELECT f."id", f."parentId"
          FROM "Folder" f, all_child_folders acf
          WHERE f."parentId" = acf."id"
      )
      SELECT * FROM all_child_folders;
      `;
  return allFiles;
}

export { getAllFilesRecursive, getAllFoldersRecursive };
