// components/CountUpCard.tsx
"use client";

import { useEffect, useState } from "react";

interface CountUpCardProps {
  title: string;
  value: number;
  unit?: string;
  description: string;
}

export const CountUpCard: React.FC<CountUpCardProps> = ({
  title,
  value,
  unit = "",
  description,
}) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    // We'll use a simple linear interpolation for the counting effect
    if (value === 0) return setCurrentValue(0);

    let startTimestamp: number | null = null;
    const duration = 1500; // Animation duration in milliseconds

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = timestamp - startTimestamp;

      // Calculate the current value based on progress
      const current = Math.min(value, (progress / duration) * value);

      setCurrentValue(Math.floor(current));

      if (progress < duration) {
        window.requestAnimationFrame(step);
      } else {
        // Ensure the final value is exactly the target value
        setCurrentValue(value);
      }
    };

    window.requestAnimationFrame(step);

    // Cleanup function
    return () => {
      setCurrentValue(0); // Reset on unmount or value change
    };
  }, [value]);

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 transition duration-300 hover:shadow-xl">
      <h3 className="text-lg font-medium text-gray-500 mb-2">{title}</h3>
      <p className="text-4xl font-extrabold text-indigo-600 mb-3">
        {currentValue.toLocaleString()}
        <span className="text-xl font-normal ml-1">{unit}</span>
      </p>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
};
