"use client";

import { useEffect, useState } from "react";

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [severity, setSeverity] = useState<string>(""); // filter by severity
  const [userId, setUserId] = useState<string>("");     // filter by userId

  useEffect(() => {
    const params = new URLSearchParams();
    if (severity) params.append("severity", severity);
    if (userId) params.append("userId", userId);

    fetch(`/api/logs?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setLogs(data));
  }, [severity, userId]);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Application Logs</h1>

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="border rounded p-2"
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
          className="border rounded p-2"
        />
      </div>

      {/* Logs Table */}
      <table className="w-full border-collapse border border-gray-700 text-sm">
        <thead>
          <tr className="bg-gray-800 text-white">
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
            <tr key={log.id} className="hover:bg-gray-100">
              <td className="p-2 border border-gray-700">
                {new Date(log.timestamp).toLocaleString()}
              </td>
              <td className="p-2 border border-gray-700">{log.severity}</td>
              <td className="p-2 border border-gray-700">{log.source}</td>
              <td className="p-2 border border-gray-700">{log.message}</td>
              <td className="p-2 border border-gray-700">{log.userId ?? "-"}</td>
              <td className="p-2 border border-gray-700">{log.requestId ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
