-- CreateTable
CREATE TABLE "ForecastEmail" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForecastEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeatherCache" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeatherCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ForecastEmail_email_idx" ON "ForecastEmail"("email");

-- CreateIndex
CREATE INDEX "ForecastEmail_status_idx" ON "ForecastEmail"("status");

-- CreateIndex
CREATE INDEX "ForecastEmail_createdAt_idx" ON "ForecastEmail"("createdAt");

-- CreateIndex
CREATE INDEX "WeatherCache_location_idx" ON "WeatherCache"("location");

-- CreateIndex
CREATE INDEX "WeatherCache_updatedAt_idx" ON "WeatherCache"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WeatherCache_location_key" ON "WeatherCache"("location");
