-- AlterTable
ALTER TABLE "WeatherCache" ADD COLUMN     "moonCountdown" TEXT,
ADD COLUMN     "moonPhase" INTEGER,
ADD COLUMN     "moonStatus" TEXT,
ADD COLUMN     "moonrise" TIMESTAMP(3),
ADD COLUMN     "moonset" TIMESTAMP(3),
ADD COLUMN     "sunCountdown" TEXT,
ADD COLUMN     "sunStatus" TEXT,
ADD COLUMN     "sunrise" TIMESTAMP(3),
ADD COLUMN     "sunset" TIMESTAMP(3),
ALTER COLUMN "data" DROP NOT NULL;
