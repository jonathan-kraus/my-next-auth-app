// components/LocationSelector.tsx
import { LOCATIONS, LocationKey } from '@/lib/weather/types';

const locationKeys: LocationKey[] = ['kop', 'brookline', 'williamstown'];

export function LocationSelector({
  selectedLocation,
  onChange,
}: {
  selectedLocation: LocationKey;
  onChange: (loc: LocationKey) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-500">Locations</div>
      <div className="flex flex-wrap gap-3">
        {locationKeys.map((locationKey) => {
          const location = LOCATIONS.find((l) => l.name === locationKey)!;

          const isSelected = selectedLocation === locationKey;

          return (
            <button
              key={locationKey}
              type="button"
              onClick={() => onChange(locationKey)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/10 text-gray-200 hover:bg-white/20'
              }`}
            >
              {location.flag && <span className="mr-2">{location.flag}</span>}
              {location.displayName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
