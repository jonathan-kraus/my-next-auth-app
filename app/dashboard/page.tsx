// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { CountUpCard } from "@/components/CountUpCard";

interface DashboardData {
  totalLogs: number;
  uniqueUserCount: number;
  topErrorSources: { source: string; _count: { id: number } }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/dashboard-metrics");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard metrics.");
        }
        const result = await response.json();
        setData(result.data);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-xl">Loading Dashboard...</div>;
  if (error)
    return <div className="p-8 text-xl text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-xl">No data available.</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        🚀 Cloud Status Dashboard
      </h1>
      <hr className="mb-8" />

      {/* --- Metrics Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CountUpCard
          title="Total Log Entries (24h)"
          value={data.totalLogs}
          description="Overall application activity in the last 24 hours."
        />
        <CountUpCard
          title="Active Users (24h)"
          value={data.uniqueUserCount}
          description="Count of unique users generating log events."
        />
        <CountUpCard
          title="Current Error Rate"
          value={data.topErrorSources.length > 0 ? 100 : 0}
          unit="%"
          description="Calculated error rate (simplified to 0% if no errors)."
        />
      </div>

      {/* --- Top Errors Section --- */}
      <h2 className="text-2xl font-semibold text-gray-700 mt-12 mb-4">
        🚨 Top Error Sources
      </h2>
      <div className="bg-white shadow rounded-lg p-6">
        {data.topErrorSources.length === 0 ? (
          <p className="text-green-600">
            No application errors logged in the last 24 hours. Great job!
          </p>
        ) : (
          <ul className="space-y-3">
            {data.topErrorSources.map((item, index) => (
              <li
                key={item.source}
                className="flex justify-between items-center border-b pb-2"
              >
                <span className="font-medium text-gray-700">
                  {index + 1}. {item.source}
                </span>
                <span className="px-3 py-1 text-sm font-bold text-white bg-red-500 rounded-full">
                  {item._count.id}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
