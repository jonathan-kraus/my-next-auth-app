import { NextResponse } from 'next/server';
import { createRequestId } from '@/lib/uuidj';
import { appLog } from '@/utils/app-log';
console.log('Neon Consumption Route Loaded');

export async function GET(request: Request) {
  const requestId = createRequestId();
  try {
    await appLog({
      source: 'app/api/neon-consumption/route.ts',
      message: 'Route invoked',
      metadata: { stage: 'init', requestId },
    });
  } catch (err) {
    console.error('Failed to write appLog', err);
  }

  try {
    const apiKey = process.env.NEON_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'NEON_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Get query parameters for date range
    const { searchParams } = new URL(request.url);
    const from =
      searchParams.get('from') ||
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const to = searchParams.get('to') || new Date().toISOString();
    const limit = searchParams.get('limit') || '10';
    const granularity = searchParams.get('granularity') || 'hourly'; // Required: hourly, daily, monthly

    // Construct API URL with query parameters
    // Note: The consumption_history endpoint returns 406 (Not Acceptable) errors
    // This endpoint likely requires a paid Neon plan or is not publicly accessible
    // TODO: Re-enable when upgraded to paid plan or Neon provides alternative endpoint
    const apiUrl = new URL(
      'https://console.neon.tech/api/v2/consumption_history/projects'
    );
    apiUrl.searchParams.set('from', from);
    apiUrl.searchParams.set('to', to);
    apiUrl.searchParams.set('limit', limit);
    apiUrl.searchParams.set('granularity', granularity); // Required by Neon API
    if (searchParams.get('cursor')) {
      apiUrl.searchParams.set('cursor', searchParams.get('cursor')!);
    }
    // Try adding org_id if available
    if (searchParams.get('org_id')) {
      apiUrl.searchParams.set('org_id', searchParams.get('org_id')!);
    }

    // Log the actual URL being called for debugging
    await appLog({
      source: 'app/api/neon-consumption/route.ts',
      message: 'Route invoked',
      metadata: {
        stage: 'init',
        requestId: requestId,
        apiUrl: apiUrl.toString(),
        from: from,
        to: to,
        limit: limit,
        granularity: granularity,
      },
    });

    const apiUrl2 = new URL('https://console.neon.tech/api/v2/projects');
    // Fetch consumption history from Neon API
    const response = await fetch(apiUrl2.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      await appLog({
        source: 'app/api/neon-consumption/route.ts',
        message: 'Neon API error',
        metadata: {
          status: response.status,
          details: errorText,
        },
        requestId,
      });

      return NextResponse.json(
        {
          error: `Neon API error: ${response.status}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    await appLog({
      source: 'app/api/neon-consumption/route.ts',
      message: 'Fetched consumption metrics from Neon API',
      metadata: {
        itemCount: data.items?.length || -9,
        requestId,
        dataSummary: JSON.stringify(data),
      },
    });
    return NextResponse.json({
      success: true,
      ...data,
      period: { from, to },
    });
  } catch (error) {
    console.log('Error fetching consumption metrics', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch consumption metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
