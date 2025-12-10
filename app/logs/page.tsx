// app/logs/page.tsx
export const dynamic = "force-dynamic";
import { getLogs } from "@/lib/logs";
import { createLogger } from "@/lib/logger";
import { createRequestId } from "@/lib/uuidj";
import { LocalTime } from "./LocalTime";
import { LiveToggle } from "./LiveToggle";
import { getCurrentUser } from "@/lib/currentUser";

const severityStyles: Record<string, string> = {
  INFO: "bg-blue-50 text-blue-700 ring-blue-600/20",
  WARN: "bg-amber-50 text-amber-700 ring-amber-600/20",
  ERROR: "bg-rose-50 text-rose-700 ring-rose-600/20",
  DEBUG: "bg-slate-50 text-slate-700 ring-slate-600/20",
};

export default async function LogsPage({
  searchParams,
}: {
  searchParams?: { severity?: string; q?: string };
}) {
  const user = await getCurrentUser();

// Safe fallback: either the email or "not known"
const userEmail = user?.email ?? "not known";

const log = createLogger("Initiating_Logs_Page");
const requestId = createRequestId();

await log.info("In logs page.", userEmail, requestId, {
  action: "create log",
  user: user});
  const severity = searchParams?.severity;
  const q = searchParams?.q?.toLowerCase() ?? "";

  const logs = await getLogs({ severity });

  const filtered = q
    ? logs.filter((log) =>
        [log.source, log.message, log.requestId, log.user?.email]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(q)),
      )
    : logs;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Application Logs
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Inspect structured logs with severity, source, and context
              metadata.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <form className="relative w-full sm:w-72" action="/logs">
              <input
                name="q"
                defaultValue={q}
                placeholder="Search message, source, request ID, user..."
                className="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 pl-9 text-sm text-slate-100 placeholder:text-slate-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-slate-500">
                🔍
              </span>
            </form>
            <form className="flex items-center gap-2" action="/logs">
              <select
                name="severity"
                defaultValue={severity ?? ""}
                className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="">All severities</option>
                <option value="ERROR">Error</option>
                <option value="WARN">Warning</option>
                <option value="INFO">Info</option>
                <option value="DEBUG">Debug</option>
              </select>
              <button
                type="submit"
                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Filter
              </button>
            </form>
          </div>
        </header>

        {/* Card container */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-2xl shadow-slate-900/60 backdrop-blur">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div className="flex items-baseline gap-2">
              <h2 className="text-sm font-semibold text-slate-200">
                Recent logs
              </h2>
              <span className="text-xs text-slate-500">
                {filtered.length} entries
              </span>
            </div>
            <span className="rounded-full bg-slate-800/80 px-3 py-1 text-xs font-medium text-slate-300">
              <LiveToggle />
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-slate-900/80">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Severity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Message
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Request / User
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((log) => {
                  const sev = log.severity.toUpperCase();
                  const badgeClass =
                    severityStyles[sev] ??
                    "bg-slate-50/10 text-slate-200 ring-slate-600/20";

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-900/80 transition-colors"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-400">
                        <LocalTime value={log.timestamp.toString()} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${badgeClass}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {sev}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-slate-200">
                        {log.source}
                      </td>
                      <td className="max-w-xl px-4 py-3 text-xs text-slate-300">
                        <p className="line-clamp-2">{log.message}</p>
                        {log.metadata && (
                          <pre className="mt-1 max-h-24 overflow-hidden rounded bg-slate-950/70 px-2 py-1 text-[10px] text-slate-400">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {log.requestId && (
                          <div className="truncate">
                            <span className="font-mono text-[11px] text-slate-300">
                              {log.requestId}
                            </span>
                          </div>
                        )}
                        {log.user && (
                          <div className="mt-1 truncate text-[11px] text-slate-400">
                            {log.user.email ?? "Unknown User"}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm text-slate-500"
                    >
                      No logs found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
