// app/components/LocationSelector.tsx
"use client";

import { motion } from "framer-motion";
import { LocationKey, LOCATIONS } from "@/lib/weather/types";
import { useLogger } from "@/lib/axiom/client";

interface LocationSelectorProps {
  selectedLocation: LocationKey;
  onLocationChange: (location: LocationKey) => void;
  isLoading?: boolean;
}

export function LocationSelector({
  selectedLocation,
  onLocationChange,
  isLoading = false,
}: LocationSelectorProps) {
  const logger = useLogger();

  const handleLocationClick = (location: LocationKey) => {
    logger.info("Location changed", {
      from: selectedLocation,
      to: location,
    });
    onLocationChange(location);
  };

  const locationKeys = Object.keys(LOCATIONS) as LocationKey[];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-lg p-6 mb-8"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        📍 Weather Location
      </h3>

      <div className="flex flex-wrap gap-3">
        {locationKeys.map((locationKey, index) => {
          const location = LOCATIONS[locationKey];
          const isSelected = selectedLocation === locationKey;

          return (
            <motion.button
              key={locationKey}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLocationClick(locationKey)}
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                isSelected
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {location.flag} {location.name}
              {isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-2 inline-block"
                >
                  ✓
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
