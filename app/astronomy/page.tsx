// app/astronomy/page.tsx
import AstroDashboard from './AstroDashboard';

const ASTRONOMY_URL = 'https://www.kraus.my.id/api/astronomy/tomorrow';

async function getAstronomy() {
  const res = await fetch(ASTRONOMY_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch astronomy data');
  const json = await res.json();
  return json.data as {
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    moonPhase: number;
  };
}

export default async function AstronomyPage() {
  const data = await getAstronomy();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <AstroDashboard data={data} />
    </div>
  );
}
