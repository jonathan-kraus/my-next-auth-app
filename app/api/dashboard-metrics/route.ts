// app/api/dashboard-metrics/route.ts

import db from "@/lib/db";
import { NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";
import { createRequestId } from "@/lib/uuidj";

// Utility function to get the timestamp for 24 hours ago
const get24HoursAgo = () => new Date(Date.now() - 24 * 3600 * 1000);

const log = createLogger("Dashboard_Metrics_API");
const TEST_USER_ID = "cmiz0p9ro000004ldrxgn3a1c";

export async function GET() {
  const requestId = createRequestId();
  await log.info("Fetching dashboard metrics.", TEST_USER_ID, requestId, {
    action: "FetchMetrics",
    requestId,
  });

  try {
    const twentyFourHoursAgo = get24HoursAgo();

    // 1. Total Error Count by Source (Top 5)
    const topErrorSources = await db.log.groupBy({
      by: ["source"],
      where: {
        severity: "error",
        timestamp: { gte: twentyFourHoursAgo },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });

    // 2. Total Unique Users (Approximate active users in the last 24h)
    const uniqueUserGroups = await db.log.groupBy({
      by: ["userId"],
      where: { timestamp: { gte: twentyFourHoursAgo } },
    });
    const uniqueUserCount = uniqueUserGroups.length;

    // 3. Total Logs (Overall Application Activity)
    const totalLogs = await db.log.count({
      where: { timestamp: { gte: twentyFourHoursAgo } },
    });

    // 4. Recent Commits (Last 10 from push events)
    const recentCommits = await db.log.findMany({
      where: {
        message: { startsWith: "commit.pushed" },
        timestamp: { gte: twentyFourHoursAgo },
      },
      orderBy: { timestamp: "desc" },
      take: 10,
      select: {
        id: true,
        message: true,
        metadata: true,
        timestamp: true,
      },
    });

    // Parse commit data from metadata
    const commits = recentCommits.map((log) => {
      const metadata = log.metadata as any;
      return {
        sha: metadata?.sha || "unknown",
        message: metadata?.message || "No message",
        author: metadata?.author || "Unknown",
        branch: metadata?.branch || "unknown",
        timestamp: log.timestamp,
      };
    });

    await log.info(
      "Metrics successfully calculated.",
      TEST_USER_ID,
      requestId,
      { totalLogs, uniqueUserCount, commitsCount: commits.length },
    );

    return NextResponse.json({
      success: true,
      data: {
        totalLogs,
        uniqueUserCount,
        topErrorSources,
        recentCommits: commits,
      },
    });
  } catch (error) {
    let errorMessage = "Failed to fetch metrics.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    await log.error(
      "Dashboard metrics calculation failed.",
      TEST_USER_ID,
      requestId,
      { error: errorMessage },
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch metrics.",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
