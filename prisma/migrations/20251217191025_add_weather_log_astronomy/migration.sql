-- CreateTable
CREATE TABLE "WeatherLog" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "condition" TEXT,
    "sunrise" TIMESTAMP(3),
    "sunset" TIMESTAMP(3),
    "moonrise" TIMESTAMP(3),
    "moonset" TIMESTAMP(3),
    "moonPhase" DOUBLE PRECISION,
    "data" JSONB,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeatherLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeatherLog_location_createdAt_idx" ON "WeatherLog"("location", "createdAt");
