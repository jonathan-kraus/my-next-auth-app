"use client";

import { useEffect, useState, useCallback } from "react";

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [severity, setSeverity] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Memoized fetch function
  const fetchLogs = useCallback(() => {
    const params = new URLSearchParams();
    if (severity) params.append("severity", severity);
    if (userId) params.append("userId", userId);

    fetch(`/api/logs?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setLastUpdated(new Date()); // ✅ update timestamp
      });
  }, [severity, userId]);

  // Initial + filter refresh
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh every 10s when enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  // Helper for severity badge styling
  const severityBadge = (sev: string) => {
    const base = "px-2 py-1 rounded text-xs font-bold";
    switch (sev.toUpperCase()) {
      case "INFO":
        return `${base} bg-green-700 text-green-100`;
      case "WARN":
        return `${base} bg-yellow-600 text-yellow-100`;
      case "ERROR":
        return `${base} bg-red-700 text-red-100`;
      default:
        return `${base} bg-gray-700 text-gray-100`;
    }
  };

  return (
    <main className="p-8 bg-gray-900 min-h-screen text-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-indigo-400">Application Logs</h1>

      {/* Filters + Auto-refresh */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="bg-gray-800 text-white border border-gray-600 rounded p-2"
        >
          <option value="">All Severities</option>
          <option value="INFO">INFO</option>
          <option value="WARN">WARN</option>
          <option value="ERROR">ERROR</option>
        </select>

        <input
          type="text"
          placeholder="Filter by User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="bg-gray-800 text-white border border-gray-600 rounded p-2"
        />

        <button
          onClick={() => setAutoRefresh((prev) => !prev)}
          className={`px-4 py-2 rounded font-semibold ${
            autoRefresh ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          {autoRefresh ? "Auto-Refresh: ON" : "Auto-Refresh: OFF"}
        </button>
      </div>

      {/* Last updated indicator */}
      {lastUpdated && (
        <p className="text-sm text-gray-400 mb-6">
          Last updated at {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-700 text-sm">
          <thead>
            <tr className="bg-gray-800 text-indigo-300">
              <th className="p-2 border border-gray-700">Timestamp</th>
              <th className="p-2 border border-gray-700">Severity</th>
              <th className="p-2 border border-gray-700">Source</th>
              <th className="p-2 border border-gray-700">Message</th>
              <th className="p-2 border border-gray-700">User</th>
              <th className="p-2 border border-gray-700">Request ID</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-800">
                <td className="p-2 border border-gray-700">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="p-2 border border-gray-700">
                  <span className={severityBadge(log.severity)}>{log.severity}</span>
                </td>
                <td className="p-2 border border-gray-700">{log.source}</td>
                <td className="p-2 border border-gray-700">{log.message}</td>
                <td className="p-2 border border-gray-700">{log.userId ?? "-"}</td>
                <td className="p-2 border border-gray-700">{log.requestId ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
