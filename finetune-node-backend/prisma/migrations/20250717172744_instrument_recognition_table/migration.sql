-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "instruments" DOUBLE PRECISION[];

-- CreateTable
CREATE TABLE "Instrument_Recognition" (
    "id" SERIAL NOT NULL,
    "instruments" TEXT[],
    "weights" JSONB NOT NULL,
    "means" JSONB NOT NULL,
    "stds" JSONB NOT NULL,

    CONSTRAINT "Instrument_Recognition_pkey" PRIMARY KEY ("id")
);
