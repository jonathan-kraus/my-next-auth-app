import { LocationKey } from "@/lib/weather/types";

export const locationLabels: Record<LocationKey, { name: string; flag: string }> = {
  kop: { name: "King of Prussia, PA", flag: "🇺🇸" },
  "brookline-ma": { name: "Brookline, MA", flag: "🇺🇸" },
  "williamstown-ma": { name: "Williamstown, MA", flag: "🇺🇸" },
  // add more keys here as needed
};