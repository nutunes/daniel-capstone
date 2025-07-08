/*
  Warnings:

  - You are about to drop the column `album_mbid` on the `Song` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[isrc]` on the table `Song` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `isrc` to the `Song` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Song" DROP COLUMN "album_mbid",
ADD COLUMN     "isrc" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Song_isrc_key" ON "Song"("isrc");
