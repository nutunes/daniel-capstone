/*
  Warnings:

  - Added the required column `album` to the `Song` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spotify_album_id` to the `Song` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "album" TEXT NOT NULL,
ADD COLUMN     "spotify_album_id" TEXT NOT NULL;
