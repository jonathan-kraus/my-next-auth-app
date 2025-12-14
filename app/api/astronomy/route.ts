import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { WeatherData } from "@/lib/weather/types";
import { getIndicator, getMoonPhaseDescription } from "@/lib/weather/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locationParam = searchParams.get("location") || "kop";

    // Read latest cached record
    const cached = await db.weatherCache.findFirst({
      where: { location: locationParam },
      orderBy: { createdAt: "desc" },
    });

    if (!cached) {
      return NextResponse.json(
        { success: false, error: "No cache found" },
        { status: 404 },
      );
    }

    // ✅ Cast JSON blob into WeatherData
    const data = cached.data as unknown as WeatherData;

    const astronomy = {
      sunrise: data.astronomy.sunrise,
      sunset: data.astronomy.sunset,
      moonrise: data.astronomy.moonrise,
      moonset: data.astronomy.moonset,
      moonPhase: data.astronomy.moonPhase,
      moonPhaseDescription: getMoonPhaseDescription(
        data.astronomy.moonPhase ?? 0,
      ),

      rawRise: data.astronomy.rawSunrise,
      rawSet: data.astronomy.rawSunset,
      rawMoonrise: data.astronomy.rawMoonrise,
      rawMoonset: data.astronomy.rawMoonset,

      // recompute indicators dynamically
      sunIndicator:
        data.astronomy.rawSunrise && data.astronomy.rawSunset
          ? getIndicator(data.astronomy.rawSunrise, data.astronomy.rawSunset)
          : undefined,
      moonIndicator:
        data.astronomy.rawMoonrise && data.astronomy.rawMoonset
          ? getIndicator(data.astronomy.rawMoonrise, data.astronomy.rawMoonset)
          : undefined,
    };

    return NextResponse.json({ success: true, astronomy });
  } catch (err: any) {
    console.error("[astronomy] error", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
