'use client';

import { useEffect, useState } from 'react';

interface CountUpCardProps {
  title: string;
  value: number;
  unit?: string;
  description: string;
}

export const CountUpCard: React.FC<CountUpCardProps> = ({
  title,
  value,
  unit = '',
  description,
}) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    let frameId: number | null = null;

    // Handle zero (or negative) values without running the animation
    if (value <= 0) {
      queueMicrotask(() => setCurrentValue(0));
      return;
    }

    const duration = 1500; // ms
    let startTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (startTimestamp === null) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(value * progress);

      setCurrentValue(current);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      } else {
        setCurrentValue(value);
      }
    };

    frameId = window.requestAnimationFrame(step);

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      // Reset asynchronously to avoid sync setState in cleanup
      queueMicrotask(() => setCurrentValue(0));
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
