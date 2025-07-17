/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Instrument_Recognition` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Instrument_Recognition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Instrument_Recognition" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Instrument_Recognition_name_key" ON "Instrument_Recognition"("name");
