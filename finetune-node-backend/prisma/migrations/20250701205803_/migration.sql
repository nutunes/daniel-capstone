/*
  Warnings:

  - A unique constraint covering the columns `[spotify_id]` on the table `Song` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Song_spotify_id_key" ON "Song"("spotify_id");
