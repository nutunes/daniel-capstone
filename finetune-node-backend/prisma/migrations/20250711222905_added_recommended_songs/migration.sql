-- CreateTable
CREATE TABLE "_RecommendedSongs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RecommendedSongs_AB_unique" ON "_RecommendedSongs"("A", "B");

-- CreateIndex
CREATE INDEX "_RecommendedSongs_B_index" ON "_RecommendedSongs"("B");

-- AddForeignKey
ALTER TABLE "_RecommendedSongs" ADD CONSTRAINT "_RecommendedSongs_A_fkey" FOREIGN KEY ("A") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecommendedSongs" ADD CONSTRAINT "_RecommendedSongs_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
