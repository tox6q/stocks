import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  try {
    const { ticker } = params;
    
    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker is required' },
        { status: 400 }
      );
    }

    // Fetch from Yahoo Finance API server-side to bypass CORS
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker.toUpperCase()}`,
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
        { error: `Failed to fetch data for ${ticker}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract the current price
    const result = data?.chart?.result?.[0];
    const currentPrice = result?.meta?.regularMarketPrice;
    
    if (typeof currentPrice !== 'number') {
      return NextResponse.json(
        { error: `No price data found for ${ticker}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      currentPrice,
      currency: result?.meta?.currency || 'USD',
      marketState: result?.meta?.marketState,
    });

  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 