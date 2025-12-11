import { NextRequest, NextResponse } from "next/server";
import { withAxiom, logger } from "@/lib/axiom/server";
import { getWeather } from "@/lib/weather/service";
import { LocationKey } from "@/lib/weather/types";
import { ApiResponse, WeatherData } from "@/lib/weather/types";

export const GET = withAxiom(async (req: NextRequest) => {
  const startTime = performance.now();

  try {
    const searchParams = req.nextUrl.searchParams;
    const location = searchParams.get("location") as LocationKey;
    const forceRefresh = searchParams.get("refresh") === "true";

    if (!location) {
      logger.warn("Weather request missing location parameter", {
        endpoint: "/api/weather",
      });

      return NextResponse.json(
        {
          success: false,
          error: "Missing location parameter",
          timestamp: new Date().toISOString(),
        } as ApiResponse<null>,
        { status: 400 },
      );
    }

    const weatherData = await getWeather(location, forceRefresh);

    const response: ApiResponse<WeatherData> = {
      success: true,
      data: weatherData,
      cached: weatherData.isCached,
      timestamp: new Date().toISOString(),
    };

    logger.info("Weather API response", {
      location,
      cached: weatherData.isCached,
      forceRefresh,
      temperature: weatherData.current.temperature,
      duration: Math.round(performance.now() - startTime),
    });

    return NextResponse.json(response);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    logger.error("Weather API error", {
      error: errorMessage,
      duration: Math.round(performance.now() - startTime),
    });

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>,
      { status: 500 },
    );
  }
});
