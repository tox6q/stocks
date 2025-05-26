import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  try {
    const { ticker } = params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'csv'; // csv, 1w, 1mo, 3mo, ytd, 1y
    
    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker is required' },
        { status: 400 }
      );
    }

    // If period is 'csv', just return current price for CSV comparison
    if (period === 'csv') {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${ticker.toUpperCase()}`,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to fetch current price for ${ticker}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      const currentPrice = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      
      return NextResponse.json({
        ticker: ticker.toUpperCase(),
        currentPrice,
        comparisonPrice: null, // Will use CSV price
        period: 'csv'
      });
    }

    // For other periods, fetch historical data to get comparison price
    const ranges = {
      '1w': '1mo',   // Get 1 month to find 1 week ago
      '1mo': '3mo',  // Get 3 months to find 1 month ago  
      '3mo': '1y',   // Get 1 year to find 3 months ago
      'ytd': '1y',   // Get 1 year to find YTD start
      '1y': '2y'     // Get 2 years to find 1 year ago
    };

    const range = ranges[period as keyof typeof ranges] || '1y';

    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker.toUpperCase()}?range=${range}&interval=1d`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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
        { error: `No data found for ${ticker}` },
        { status: 404 }
      );
    }

    const timestamps = result.timestamp;
    const prices = result.indicators?.quote?.[0]?.close;
    const currentPrice = result.meta?.regularMarketPrice;
    
    if (!timestamps || !prices || !currentPrice) {
      return NextResponse.json(
        { error: `Invalid data format for ${ticker}` },
        { status: 500 }
      );
    }

    // Calculate target date based on period
    const now = new Date();
    let targetDate: Date;
    
    switch (period) {
      case '1w':
        targetDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1mo':
        targetDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '3mo':
        targetDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'ytd':
        targetDate = new Date(now.getFullYear(), 0, 1); // January 1st
        break;
      case '1y':
        targetDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        targetDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to 1 month
    }

    // Find the closest price to target date
    let closestIndex = 0;
    let minDiff = Math.abs(timestamps[0] * 1000 - targetDate.getTime());
    
    for (let i = 1; i < timestamps.length; i++) {
      const diff = Math.abs(timestamps[i] * 1000 - targetDate.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    const comparisonPrice = prices[closestIndex];

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      currentPrice,
      comparisonPrice: comparisonPrice ? parseFloat(comparisonPrice.toFixed(2)) : null,
      period,
      comparisonDate: new Date(timestamps[closestIndex] * 1000).toISOString().split('T')[0]
    });

  } catch (error) {
    console.error('Error fetching comparison data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 