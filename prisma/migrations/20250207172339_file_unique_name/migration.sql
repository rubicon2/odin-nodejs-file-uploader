/*
  Warnings:

  - A unique constraint covering the columns `[url,name,folderId]` on the table `File` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "File_url_folderId_key";

-- CreateIndex
CREATE UNIQUE INDEX "File_url_name_folderId_key" ON "File"("url", "name", "folderId");
