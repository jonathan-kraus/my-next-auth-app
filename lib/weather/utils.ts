// lib/weather/utils.ts
export interface BodyIndicator {
  status: "Up" | "Down";
  countdown?: string;
}

export function getIndicator(
  startIso?: string,
  endIso?: string,
): BodyIndicator | undefined {
  if (!startIso || !endIso) return undefined;

  const now = new Date();
  const start = new Date(startIso);
  const end = new Date(endIso);

  if (now < start) {
    const minutes = Math.round((start.getTime() - now.getTime()) / 60000);
    return { status: "Down", countdown: `Rises in ${minutes} min` };
  }
  if (now > end) {
    const minutes = Math.round((end.getTime() - now.getTime()) / 60000);
    return { status: "Down", countdown: `Set ${Math.abs(minutes)} min ago` };
  }
  const minutes = Math.round((end.getTime() - now.getTime()) / 60000);
  return { status: "Up", countdown: `Sets in ${minutes} min` };
}

export function getMoonPhaseDescription(phase: number): string {
  const phases = [
    "New Moon",
    "Waxing Crescent",
    "First Quarter",
    "Waxing Gibbous",
    "Full Moon",
    "Waning Gibbous",
    "Last Quarter",
    "Waning Crescent",
  ];
  return phases[phase] ?? "Unknown";
}
