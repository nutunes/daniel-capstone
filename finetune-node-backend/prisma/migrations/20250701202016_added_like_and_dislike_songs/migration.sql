/*
  Warnings:

  - You are about to drop the `_SongToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_SongToUser" DROP CONSTRAINT "_SongToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_SongToUser" DROP CONSTRAINT "_SongToUser_B_fkey";

-- DropTable
DROP TABLE "_SongToUser";

-- CreateTable
CREATE TABLE "_LikedSongs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LikedSongs_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DislikedSongs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DislikedSongs_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_LikedSongs_B_index" ON "_LikedSongs"("B");

-- CreateIndex
CREATE INDEX "_DislikedSongs_B_index" ON "_DislikedSongs"("B");

-- AddForeignKey
ALTER TABLE "_LikedSongs" ADD CONSTRAINT "_LikedSongs_A_fkey" FOREIGN KEY ("A") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LikedSongs" ADD CONSTRAINT "_LikedSongs_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DislikedSongs" ADD CONSTRAINT "_DislikedSongs_A_fkey" FOREIGN KEY ("A") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DislikedSongs" ADD CONSTRAINT "_DislikedSongs_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
