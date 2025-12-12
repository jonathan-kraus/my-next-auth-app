// app/api/weather/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAxiom, logger } from "@/lib/axiom/server";
import { getWeather } from "@/lib/weather/service";
import {
  ApiResponse,
  WeatherData,
  LocationKey,
  getLocationByName,
} from "@/lib/weather/types";

export const GET = withAxiom(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const locationParam = (searchParams.get("location") || "kop") as LocationKey;
    const forceRefresh = searchParams.get("force") === "true";
    const refresh = searchParams.get("refresh") === "true";

    const location = getLocationByName(locationParam);

    console.log("[weather] incoming", {
      locationParam,
      location,
      refresh,
      forceRefresh,
    });

    if (!location) {
      return NextResponse.json<ApiResponse<WeatherData>>(
        {
          success: false,
          error: `Unknown location: ${locationParam}`,
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      );
    }

    const weatherData = await getWeather(locationParam);

    console.log("[weather] success", {
      locationParam,
      refresh,
      forceRefresh,
    });

    const response: ApiResponse<WeatherData> = {
      success: true,
      data: weatherData,
      cached: weatherData.isCached,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("[weather] error", {
      message: error?.message,
      stack: error?.stack,
    });

    logger.error("Weather API error", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json<ApiResponse<WeatherData>>(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error fetching weather",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
});
