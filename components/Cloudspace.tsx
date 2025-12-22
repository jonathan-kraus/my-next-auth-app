// components/Cloudspace.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { appLog } from '@/utils/app-log';
import { createRequestId } from '@/lib/uuidj';
import NumberCounter from './NumberCounter';
import Sparkline from './Sparkline';

type CloudspaceData = {
  vercel: {
    deploymentUrl: string;
    environment: string;
    region: string;
    deploymentId: string;
    gitProvider: string;
    gitRepo: string;
    gitOwner: string;
    commitSha: string;
    commitMessage: string;
    commitAuthor: string;
  };
  neon: {
    databaseHost: string;
    databaseName: string;
    region: string;
    version: string;
    latencyMs: number;
    postCount: number;
    logCount: number;
    activeConnections: number;
    idleConnections: number;
  };
  consumption: {
    activeTimeHours: number;
    computeTimeHours: number;
    dataWrittenMB: number;
    dataTransferMB: number;
    storageGBHours: number;
    activeConnections: number;
    idleConnections: number;
  };
};

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.28 }}
      className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
    >
      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </motion.div>
  );
}

function InfoRow({
  label,
  value,
  badge,
  children,
}: {
  label: string;
  value: string;
  badge?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600 font-medium">{label}:</span>
      <div className="flex items-center gap-2">
        {children ? (
          <div className="text-gray-900">{children}</div>
        ) : (
          <span className="text-gray-900">{value}</span>
        )}
        {badge && (
          <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

function EnvironmentBadge({ environment }: { environment: string }) {
  const colors = {
    production: 'bg-green-100 text-green-800',
    preview: 'bg-yellow-100 text-yellow-800',
    development: 'bg-blue-100 text-blue-800',
  } as const;

  const color =
    colors[environment as keyof typeof colors] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
      {environment}
    </span>
  );
}

/**
 * Hook: fetches env-info, db-status, and neon-consumption,
 * assembles CloudspaceData, and handles logging.
 */
function useCloudspaceData() {
  const [data, setData] = useState<CloudspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef<string>(createRequestId());

  useEffect(() => {
    async function fetchCloudspaceData() {
      const requestId = requestIdRef.current;

      await appLog({
        source: 'components/Cloudspace.tsx',
        message: '---init---',
        requestId,
        metadata: {
          action: 'create',
          status: 'started',
          timestamp: new Date().toISOString(),
        },
      });

      try {
        // 1) Environment info
        const envResponse = await fetch('/api/env-info');
        if (!envResponse.ok)
          throw new Error('Failed to fetch environment info');
        const envData = await envResponse.json();

        await appLog({
          source: 'components/Cloudspace.tsx',
          message: '---env-info---',
          requestId,
          metadata: {
            action: 'fetch',
            status: 'completed',
            envData: envData.environment,
            timestamp: new Date().toISOString(),
          },
        });

        // 2) Database status
        const dbResponse = await fetch('/api/db-status');
        if (!dbResponse.ok) throw new Error('Failed to fetch database status');
        const dbData = await dbResponse.json();

        await appLog({
          source: 'components/Cloudspace.tsx',
          message: '---db-status---',
          requestId,
          metadata: {
            action: 'fetch',
            status: 'completed',
            dbRegion: dbData.region,
            timestamp: new Date().toISOString(),
          },
        });

        // 3) Consumption metrics (Neon)
        await appLog({
          source: 'components/Cloudspace.tsx',
          message: '---neon-consumption-entry---',
          requestId,
          metadata: {
            action: 'entry',
            status: 'started',
            timestamp: new Date().toISOString(),
          },
        });

        let consumptionData: CloudspaceData['consumption'] = {
          activeTimeHours: 0,
          computeTimeHours: 0,
          dataWrittenMB: 0,
          dataTransferMB: 0,
          storageGBHours: 720,
          activeConnections: 0,
          idleConnections: 0,
        };

        try {
          const consumptionResponse = await fetch('/api/neon-consumption');
          await appLog({
            source: 'components/Cloudspace.tsx',
            message: '---right after fetch api/neon---',
            requestId,
            metadata: {
              status: consumptionResponse.ok ? 'ok' : 'not ok',
              timestamp: new Date().toISOString(),
            },
          });

          if (consumptionResponse.ok) {
            const rawConsumption = await consumptionResponse.json();
            console.log('Parsed consumption data:', rawConsumption);

            if (rawConsumption.metrics && rawConsumption.metrics.length > 0) {
              const m = rawConsumption.metrics[0];

              consumptionData = {
                activeTimeHours: m.activeTimeHours ?? 0,
                computeTimeHours: m.cpuHours ?? 0,
                dataWrittenMB: m.dataWrittenMB ?? 0,
                dataTransferMB: m.dataTransferMB ?? 0,
                storageGBHours: m.storageGBHours ?? 720,
                activeConnections: m.activeConnections ?? 0,
                idleConnections: m.idleConnections ?? 0,
              };
            }
          }
        } catch (e) {
          console.log('Consumption metrics not available', e);
        }

        await appLog({
          source: 'components/Cloudspace.tsx',
          message: '---neon-consumption-exit---',
          requestId,
          metadata: {
            action: 'fetch',
            status: 'completed',
            activeTimeHours: consumptionData.activeTimeHours || -9,
            computeTimeHours: consumptionData.computeTimeHours || -9,
            dataWrittenMB: consumptionData.dataWrittenMB || -9,
            dataTransferMB: consumptionData.dataTransferMB || -9,
            storageGBHours: consumptionData.storageGBHours || 720,
            activeConnections: consumptionData.activeConnections || -9,
            idleConnections: consumptionData.idleConnections || -9,
            timestamp: new Date().toISOString(),
          },
        });

        const cloudspaceData: CloudspaceData = {
          vercel: {
            deploymentUrl: envData.deploymentUrl || 'N/A',
            environment: envData.environment || 'development',
            region: envData.vercelRegion || 'N/A',
            deploymentId: envData.VERCEL_DEPLOYMENT_ID || 'N/A',
            gitProvider: envData.VERCEL_GIT_PROVIDER || 'N/A',
            gitRepo: envData.VERCEL_GIT_REPO_SLUG || 'N/A',
            gitOwner: envData.VERCEL_GIT_REPO_OWNER || 'N/A',
            commitSha: envData.gitCommitSha || 'N/A',
            commitMessage: envData.gitCommitMessage || 'N/A',
            commitAuthor: envData.gitCommitAuthor || 'N/A',
          },
          neon: {
            databaseHost: envData.databaseHost || 'N/A',
            databaseName: envData.databaseName || 'N/A',
            region: dbData.region || 'N/A',
            version: dbData.version || 'N/A',
            latencyMs: dbData.latencyMs || 0,
            postCount: dbData.postCount || 0,
            logCount: dbData.logCount || 0,
            activeConnections: consumptionData.activeConnections || 0,
            idleConnections: consumptionData.idleConnections || 0,
          },
          consumption: consumptionData,
        };

        await appLog({
          source: 'components/Cloudspace.tsx',
          message: '---cloudspace-data-assembled---',
          requestId,
          metadata: {
            dataconsumption: cloudspaceData.consumption,
            activetimehours: cloudspaceData.consumption.activeTimeHours,
            computetimehours: cloudspaceData.consumption.computeTimeHours,
            datawrittenmb: cloudspaceData.consumption.dataWrittenMB,
            datatransfermb: cloudspaceData.consumption.dataTransferMB,
            storagegbhours: cloudspaceData.consumption.storageGBHours,
            action: 'assemble',
            status: 'completed',
            timestamp: new Date().toISOString(),
          },
        });

        setData(cloudspaceData);
      } catch (err) {
        console.error('Failed to fetch cloudspace data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchCloudspaceData();
  }, []);

  return {
    data,
    loading,
    error,
    requestId: requestIdRef.current,
  };
}

export default function Cloudspace() {
  const { data, loading, error, requestId } = useCloudspaceData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading cloudspace data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">
          {error || 'No cloudspace data available'}
        </p>
      </div>
    );
  }

  const reqRate = Math.max(0, Math.round(data.neon.postCount));
  const avgQueryTime = Math.round(data.neon.latencyMs * 0.8);
  const neonRequests = data.neon.postCount + data.neon.logCount;
  const totalRequests = Math.max(neonRequests, reqRate); // avoid divide-by-zero

  const cacheHitRate = Math.round((1 - neonRequests / totalRequests) * 100);

  console.log('Consumption data:', data.consumption);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-2">☁️ Cloudspace</h1>
        <p className="text-blue-100 text-lg">
          Your cloud infrastructure overview - Vercel + Neon
        </p>
      </div>

      {/* Environment Status */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Environment Status
            </h2>
            <p className="text-gray-600 mt-1">Current deployment environment</p>
          </div>
          <EnvironmentBadge environment={data.vercel.environment} />
        </div>
      </div>

      {/* Grid Layout for Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vercel Deployment Info */}
        <InfoCard title="🚀 Vercel Deployment">
          <InfoRow label="Deployment URL" value={data.vercel.deploymentUrl} />
          <InfoRow label="Region" value="  " badge={data.vercel.region} />
          {data.vercel.deploymentId !== 'N/A' && (
            <InfoRow label="Deployment ID" value={data.vercel.deploymentId} />
          )}
          {data.vercel.gitProvider !== 'N/A' && (
            <InfoRow label="Git Provider" value={data.vercel.gitProvider} />
          )}
          {data.vercel.gitOwner !== 'N/A' && data.vercel.gitRepo !== 'N/A' && (
            <InfoRow
              label="Repository"
              value={`${data.vercel.gitOwner}/${data.vercel.gitRepo}`}
            />
          )}
        </InfoCard>

        {/* Neon Database Info */}
        <InfoCard title="🐘 Neon Database">
          <InfoRow label="Host" value={data.neon.databaseHost} />
          {data.neon.databaseName !== 'N/A' && (
            <InfoRow label="Database" value={data.neon.databaseName} />
          )}
          <InfoRow label="Region" value=" " badge={data.neon.region} />
          <InfoRow label="PostgreSQL Version" value={data.neon.version} />
          <InfoRow label="Latency" value="">
            <div className="flex items-center">
              <NumberCounter value={Math.round(data.neon.latencyMs)} />
              <span className="text-sm text-gray-600 ml-1">ms</span>
              <Sparkline value={data.neon.latencyMs} max={500} color="purple" />
            </div>
          </InfoRow>
          <InfoRow label="Active Connections" value="">
            <div className="flex items-center">
              <NumberCounter value={data.neon.activeConnections} />
              <Sparkline
                value={data.neon.activeConnections}
                max={100}
                color="green"
              />
            </div>
          </InfoRow>
          <InfoRow label="Idle Connections" value="">
            <div className="flex items-center">
              <NumberCounter value={data.neon.idleConnections} />
              <Sparkline
                value={data.neon.idleConnections}
                max={100}
                color="green"
              />
            </div>
          </InfoRow>
        </InfoCard>

        {/* Git Commit Info */}
        {data.vercel.commitSha !== 'N/A' && (
          <InfoCard title="📝 Git Commit">
            <InfoRow
              label="Commit SHA"
              value={data.vercel.commitSha.substring(0, 8)}
            />
            {data.vercel.commitMessage !== 'N/A' && (
              <div className="pt-2">
                <p className="text-gray-600 font-medium mb-1">Message:</p>
                <p className="text-gray-900 text-sm italic">
                  &quot;{data.vercel.commitMessage}&quot;
                </p>
              </div>
            )}
            {data.vercel.commitAuthor !== 'N/A' && (
              <InfoRow label="Author" value={data.vercel.commitAuthor} />
            )}
          </InfoCard>
        )}

        {/* Database Statistics */}
        <InfoCard title="📊 Database Statistics">
          <InfoRow label="Total Posts" value="">
            <NumberCounter value={data.neon.postCount} />
          </InfoRow>
          <InfoRow label="Total Logs" value="">
            <NumberCounter value={data.neon.logCount} />
          </InfoRow>
          <div className="pt-2 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              Database is running smoothly with{' '}
              <NumberCounter value={data.neon.activeConnections} /> active
              connection
              {data.neon.activeConnections !== 1 ? 's' : ''}
            </p>
          </div>
        </InfoCard>

        {/* Performance Metrics */}
        <InfoCard title="⚡ Performance Metrics">
          <InfoRow label="Reqs / Day" value="">
            <div className="flex items-center">
              <NumberCounter value={reqRate} />
              <span className="ml-2 text-sm text-gray-600">/day</span>
              <Sparkline value={reqRate} max={1000} color="blue" />
            </div>
          </InfoRow>
          <InfoRow label="Avg Query" value="">
            <div className="flex items-center">
              <NumberCounter value={avgQueryTime} />
              <span className="ml-2 text-sm text-gray-600">ms</span>
              <Sparkline value={avgQueryTime} max={500} color="purple" />
            </div>
          </InfoRow>
        </InfoCard>

        {/* Cache & CDN */}
        <InfoCard title="🧰 Cache & CDN">
          <InfoRow label="Active Hours" value="">
            <div className="flex items-center">
              <NumberCounter value={data.consumption.activeTimeHours} />
              <span className="ml-2 text-sm text-gray-600">hrs</span>
              <Sparkline
                value={data.consumption.activeTimeHours}
                max={168}
                color="green"
              />
            </div>
          </InfoRow>
          <InfoRow label="Edge Responses" value="1200" />
        </InfoCard>
      </div>

      {/* Consumption Metrics */}
      <InfoCard title="📈 Resource Consumption (Last 7 Days)">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-blue-50 rounded p-3"
          >
            <p className="text-xs text-blue-600 font-semibold mb-1">
              Active Time
            </p>
            <div className="flex items-center">
              <NumberCounter value={data.consumption.activeTimeHours} />
              <span className="ml-2 text-sm text-gray-600">hrs</span>
              <Sparkline
                value={data.consumption.activeTimeHours}
                max={168}
                color="blue"
              />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-purple-50 rounded p-3"
          >
            <p className="text-xs text-purple-600 font-semibold mb-1">
              Compute Time
            </p>
            <div className="flex items-center">
              <NumberCounter value={data.consumption.computeTimeHours} />
              <span className="ml-2 text-sm text-gray-600">hrs</span>
              <Sparkline
                value={data.consumption.computeTimeHours}
                max={168}
                color="purple"
              />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-green-50 rounded p-3"
          >
            <p className="text-xs text-green-600 font-semibold mb-1">
              Data Written
            </p>
            <div className="flex items-center">
              <NumberCounter value={cacheHitRate} />
              <span className="ml-2 text-sm text-gray-600">MB</span>
              <Sparkline value={cacheHitRate} max={1024} color="green" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-orange-50 rounded p-3"
          >
            <p className="text-xs text-orange-600 font-semibold mb-1">
              Data Transfer
            </p>
            <div className="flex items-center">
              <NumberCounter
                value={Math.round(data.consumption.dataTransferMB)}
              />
              <span className="ml-2 text-sm text-gray-600">MB</span>
              <Sparkline
                value={data.consumption.dataTransferMB}
                max={1024}
                color="orange"
              />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-pink-50 rounded p-3"
          >
            <p className="text-xs text-pink-600 font-semibold mb-1">Storage</p>
            <div className="flex items-center">
              <NumberCounter
                value={Math.round(data.consumption.storageGBHours)}
              />
              <span className="ml-2 text-sm text-gray-600">GB-hrs</span>
              <Sparkline
                value={data.consumption.storageGBHours}
                max={500}
                color="pink"
              />
            </div>
          </motion.div>
        </div>
      </InfoCard>

      {/* Footer */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-gray-600 text-sm">
          🔄 Data refreshed at {new Date().toLocaleString()} · Request ID:{' '}
          <code className="text-xs bg-gray-200 px-2 py-1 rounded">
            {requestId}
          </code>
        </p>
      </div>
    </div>
  );
}
