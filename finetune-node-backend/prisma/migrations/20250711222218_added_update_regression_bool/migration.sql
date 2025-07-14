/*
  Warnings:

  - The primary key for the `_DislikedSongs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_LikedSongs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_DislikedSongs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_LikedSongs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updateRegression" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "_DislikedSongs" DROP CONSTRAINT "_DislikedSongs_AB_pkey";

-- AlterTable
ALTER TABLE "_LikedSongs" DROP CONSTRAINT "_LikedSongs_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_DislikedSongs_AB_unique" ON "_DislikedSongs"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_LikedSongs_AB_unique" ON "_LikedSongs"("A", "B");
