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
    const locationParam = (searchParams.get("location") ||
      "kop") as LocationKey;

    const location = getLocationByName(locationParam);
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

    // Get mapped weather data (from cache or live)
    const weatherData = await getWeather(locationParam);
    const data = weatherData as WeatherData;

    // ✅ Enrich astronomy with Prisma fields if present
    if (data.astronomy) {
      // These fields should now exist in your WeatherCache model
      data.astronomy.rawSunrise = weatherData.sunrise?.toISOString();
      data.astronomy.rawSunset = weatherData.sunset?.toISOString();
      data.astronomy.rawMoonrise = weatherData.moonrise?.toISOString();
      data.astronomy.rawMoonset = weatherData.moonset?.toISOString();
      data.astronomy.moonPhase = weatherData.moonPhase ?? 0;

      data.astronomy.sunIndicator = {
        status: weatherData.sunStatus ?? "Down",
        countdown: weatherData.sunCountdown ?? undefined,
      };
      data.astronomy.moonIndicator = {
        status: weatherData.moonStatus ?? "Down",
        countdown: weatherData.moonCountdown ?? undefined,
      };
    }

    const response: ApiResponse<WeatherData> = {
      success: true,
      data,
      cached: weatherData.isCached,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
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
