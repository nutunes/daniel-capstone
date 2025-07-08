/*
  Warnings:

  - You are about to drop the column `spotify_album_id` on the `Song` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[recording_mbid]` on the table `Song` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `album_mbid` to the `Song` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recording_mbid` to the `Song` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Song" DROP COLUMN "spotify_album_id",
ADD COLUMN     "album_mbid" TEXT NOT NULL,
ADD COLUMN     "recording_mbid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Song_recording_mbid_key" ON "Song"("recording_mbid");
