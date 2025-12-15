// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { CountUpCard } from '@/components/CountUpCard';
import { useLogger } from '@/lib/axiom/client';

interface CommitData {
  sha: string;
  message: string;
  author: string;
  branch: string;
  timestamp: string;
}

interface DashboardData {
  totalLogs: number;
  uniqueUserCount: number;
  topErrorSources: { source: string; _count: { id: number } }[];
  recentCommits: CommitData[];
}

export default function DashboardPage() {
  const logger = useLogger();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchDuration, setFetchDuration] = useState<number>(0);

  useEffect(() => {
    logger.info('Dashboard page accessed', {
      page: 'dashboard',
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    });

    async function fetchData() {
      const startTime = performance.now();

      try {
        logger.debug('Fetching dashboard metrics', {
          endpoint: '/api/dashboard-metrics',
          timestamp: new Date().toISOString(),
        });

        const response = await fetch('/api/dashboard-metrics');

        if (!response.ok) {
          const error = new Error('Failed to fetch dashboard metrics.');
          logger.error('Dashboard fetch failed', {
            status: response.status,
            statusText: response.statusText,
            error: error.message,
            endpoint: '/api/dashboard-metrics',
          });
          throw error;
        }

        const result = await response.json();
        const duration = performance.now() - startTime;
        setFetchDuration(duration);

        logger.info('Dashboard metrics fetched successfully', {
          duration: Math.round(duration),
          totalLogs: result.data.totalLogs,
          uniqueUsers: result.data.uniqueUserCount,
          errorSourcesCount: result.data.topErrorSources.length,
          commitsCount: result.data.recentCommits.length,
          endpoint: '/api/dashboard-metrics',
        });

        setData(result.data);
      } catch (e) {
        const error = e as Error;
        setError(error.message);

        logger.error('Dashboard data fetch error', {
          error: error.message,
          stack: error.stack,
          duration: Math.round(performance.now() - startTime),
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [logger]);

  if (loading) {
    return <div className="p-8 text-xl">Loading Dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-xl text-red-600">Error: {error}</div>;
  }

  if (!data) {
    return <div className="p-8 text-xl">No data available.</div>;
  }

  const errorRate =
    data.totalLogs > 0
      ? Math.round(
          (data.topErrorSources.reduce((sum, item) => sum + item._count.id, 0) /
            data.totalLogs) *
            100
        )
      : 0;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-full p-8">
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
            value={errorRate}
            unit="%"
            description="Calculated error rate from top error sources."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* --- Recent Commits Section --- */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              📝 Recent Commits
            </h2>
            <div className="bg-white shadow rounded-lg p-6">
              {data.recentCommits.length === 0 ? (
                <p className="text-gray-500">
                  No commits in the last 24 hours.
                </p>
              ) : (
                <ul className="space-y-4">
                  {data.recentCommits.slice(0, 5).map((commit) => (
                    <li
                      key={commit.sha}
                      className="border-b pb-3 last:border-b-0 hover:bg-gray-50 p-2 rounded transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 mb-1">
                            {commit.message.split('\n')[0]}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              👤 {commit.author}
                            </span>
                            <span className="flex items-center gap-1">
                              🌿 {commit.branch}
                            </span>
                            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                              {commit.sha}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 ml-4">
                          {new Date(commit.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* --- Top Errors Section --- */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
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
                      className="flex justify-between items-center border-b pb-2 last:border-b-0"
                      onClick={() => {
                        logger.debug('Error source clicked', {
                          source: item.source,
                          count: item._count.id,
                          index: index + 1,
                        });
                      }}
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
        </div>
      </div>
    </div>
  );
}
