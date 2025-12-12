"use client";

import { useEffect, useState, useCallback, useRef } from "react";

type LogRow = {
  id: string;
  timestamp: string;
  severity: string;
  source: string;
  message: string;
  user?: { name?: string | null } | null;
  requestId?: string | null;
  metadata: unknown;
  isNew?: boolean;
  expanded?: boolean;
};

type TableCount = {
  schema_name: string;
  table_name: string;
  estimated_row_count: number;
};

type ColumnConfig = {
  id: string;
  header: string;
  accessor: (log: LogRow) => string;
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [severity, setSeverity] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [tableCounts, setTableCounts] = useState<TableCount[]>([]);
  const [tablesLoadedAt, setTablesLoadedAt] = useState<Date | null>(null);

  const [draggedColumn, setDraggedColumn] = useState<number | null>(null);

  const seenIds = useRef<Set<string>>(new Set());

  // Column configuration - reorder these as needed!
  const [columns, setColumns] = useState<ColumnConfig[]>([
    {
      id: "timestamp",
      header: "Timestamp",
      accessor: (log) => new Date(log.timestamp).toLocaleString(),
    },
    {
      id: "severity",
      header: "Severity",
      accessor: (log) => log.severity,
    },
    {
      id: "source",
      header: "Source",
      accessor: (log) => log.source,
    },
    {
      id: "message",
      header: "Message",
      accessor: (log) => log.message,
    },
    {
      id: "user",
      header: "User",
      accessor: (log) => log.user?.name ?? "-",
    },
    {
      id: "metadata",
      header: "Metadata",
      accessor: (log) => JSON.stringify(log.metadata).slice(0, 50) + "...",
    },
  ]);

  const fetchLogs = useCallback(() => {
    const params = new URLSearchParams();
    if (severity) params.append("severity", severity);
    if (userId) params.append("userId", userId);

    fetch(`/api/logs?${params.toString()}`)
      .then((res) => res.json())
      .then((data: LogRow[]) => {
        const updated = data.map((log) => ({
          ...log,
          isNew: !seenIds.current.has(log.id),
          expanded: false,
        }));

        updated.forEach((log) => seenIds.current.add(log.id));

        setLogs(updated);
        setLastUpdated(new Date());

        setTimeout(() => {
          setLogs((prev) => prev.map((log) => ({ ...log, isNew: false })));
        }, 4000);
      });
  }, [severity, userId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  useEffect(() => {
    fetch("/api/db-table-counts")
      .then((res) => res.json())
      .then((rows: TableCount[]) => {
        setTableCounts(rows);
        setTablesLoadedAt(new Date());
      })
      .catch(() => {
        setTableCounts([]);
      });
  }, []);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedColumn(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget.innerHTML);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedColumn === null || draggedColumn === dropIndex) return;

    const newColumns = [...columns];
    const [draggedItem] = newColumns.splice(draggedColumn, 1);
    newColumns.splice(dropIndex, 0, draggedItem);

    setColumns(newColumns);
    setDraggedColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedColumn(null);
  };

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

  const toggleExpand = (id: string) => {
    setLogs((prev) =>
      prev.map((log) =>
        log.id === id ? { ...log, expanded: !log.expanded } : log,
      ),
    );
  };

  const copyMetadata = (metadata: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(metadata, null, 2));
  };

  const renderCell = (log: LogRow, column: ColumnConfig) => {
    if (column.id === "severity") {
      return (
        <span className={severityBadge(log.severity)}>{log.severity}</span>
      );
    }
    return column.accessor(log);
  };

  return (
    <main className="p-8 bg-gray-900 min-h-screen text-gray-100 space-y-8">
      <h1 className="text-3xl font-bold text-indigo-400">Application Logs</h1>

      {/* Quick DB summary */}
      <section className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-indigo-300">
            Database Tables
          </h2>
          {tablesLoadedAt && (
            <span className="text-xs text-gray-400">
              Loaded at {tablesLoadedAt.toLocaleTimeString()}
            </span>
          )}
        </div>
        {tableCounts.length === 0 ? (
          <p className="text-sm text-gray-400">No table stats loaded.</p>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full border-collapse border border-gray-700 text-xs">
              <thead>
                <tr className="bg-gray-900 text-indigo-200">
                  <th className="p-2 border border-gray-700 text-left">
                    Schema
                  </th>
                  <th className="p-2 border border-gray-700 text-left">
                    Table
                  </th>
                  <th className="p-2 border border-gray-700 text-right">
                    Est. Rows
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableCounts.map((t) => (
                  <tr key={`${t.schema_name}.${t.table_name}`}>
                    <td className="p-2 border border-gray-700">
                      {t.schema_name}
                    </td>
                    <td className="p-2 border border-gray-700">
                      {t.table_name}
                    </td>
                    <td className="p-2 border border-gray-700 text-right">
                      {t.estimated_row_count.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Existing logs UI */}
      <section>
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
              autoRefresh
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {autoRefresh ? "Auto-Refresh: ON" : "Auto-Refresh: OFF"}
          </button>
        </div>

        {lastUpdated && (
          <p className="text-sm text-gray-400 mb-4">
            Logs last updated at {lastUpdated.toLocaleTimeString()}
          </p>
        )}

        <p className="text-xs text-gray-500 mb-2">
          💡 Drag column headers to reorder
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-700 text-sm">
            <thead>
              <tr className="bg-gray-800 text-indigo-300">
                {columns.map((column, index) => (
                  <th
                    key={column.id}
                    className={`p-2 border border-gray-700 cursor-move select-none ${
                      draggedColumn === index
                        ? "opacity-50 bg-indigo-900"
                        : "hover:bg-gray-700"
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <>
                  <tr
                    key={log.id}
                    className={`hover:bg-gray-800 transition-colors duration-1000 ${
                      log.isNew ? "bg-blue-900" : ""
                    } cursor-pointer`}
                    onClick={() => toggleExpand(log.id)}
                  >
                    {columns.map((column) => (
                      <td
                        key={`${log.id}-${column.id}`}
                        className="p-2 border border-gray-700"
                      >
                        {renderCell(log, column)}
                      </td>
                    ))}
                  </tr>
                  {log.expanded && (
                    <tr key={`${log.id}-meta`}>
                      <td
                        colSpan={columns.length}
                        className="bg-gray-800 text-gray-300 p-4 border border-gray-700"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">Metadata</span>
                          <button
                            onClick={() => copyMetadata(log.metadata)}
                            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
                          >
                            Copy
                          </button>
                        </div>
                        <pre className="whitespace-pre-wrap text-xs">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
