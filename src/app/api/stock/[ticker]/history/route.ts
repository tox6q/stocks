import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  try {
    const { ticker } = params;
    const { searchParams } = new URL(request.url);
    
    // Default to 30 days of data
    const range = searchParams.get('range') || '1mo';
    const interval = searchParams.get('interval') || '1d';
    
    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker is required' },
        { status: 400 }
      );
    }

    // Fetch historical data from Yahoo Finance
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker.toUpperCase()}?range=${range}&interval=${interval}`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch historical data for ${ticker}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    const result = data?.chart?.result?.[0];
    if (!result) {
      return NextResponse.json(
        { error: `No historical data found for ${ticker}` },
        { status: 404 }
      );
    }

    const timestamps = result.timestamp;
    const prices = result.indicators?.quote?.[0]?.close;
    
    if (!timestamps || !prices) {
      return NextResponse.json(
        { error: `Invalid data format for ${ticker}` },
        { status: 500 }
      );
    }

    // Format data for the chart
    const chartData = timestamps.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toISOString().split('T')[0],
      price: prices[index] ? parseFloat(prices[index].toFixed(2)) : null,
    })).filter((item: any) => item.price !== null);

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      data: chartData,
      meta: {
        currency: result.meta?.currency || 'USD',
        exchangeName: result.meta?.exchangeName,
        symbol: result.meta?.symbol,
        currentPrice: result.meta?.regularMarketPrice,
      }
    });

  } catch (error) {
    console.error('Error fetching historical stock data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 