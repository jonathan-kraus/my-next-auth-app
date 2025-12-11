// app/api/weather/all/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAllWeather } from "@/lib/weather/service";
import { logger } from "@/lib/axiom/server";

export async function GET(request: NextRequest) {
  const startTime = performance.now();

  try {
    logger.info("Fetching all weather data", {
      timestamp: new Date().toISOString(),
    });

    const weatherData = await getAllWeather();

    logger.info("All weather data fetched successfully", {
      locationCount: weatherData.length,
      duration: Math.round(performance.now() - startTime),
    });

    return NextResponse.json({
      success: true,
      data: weatherData,
      cached: weatherData.some((w) => w.isCached),
    });
  } catch (error) {
    logger.error("Failed to fetch all weather data", {
      error: error instanceof Error ? error.message : String(error),
      duration: Math.round(performance.now() - startTime),
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
