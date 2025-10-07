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

    const apiKey = process.env.FINNHUB_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Finnhub API key not configured' },
        { status: 500 }
      );
    }

    // Fetch company profile from Finnhub
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker.toUpperCase()}&token=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch company info for ${ticker}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Check if data is empty (invalid ticker)
    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: `No company information found for ${ticker}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      name: data.name || '',
      logo: data.logo || '',
      country: data.country || '',
      currency: data.currency || 'USD',
      exchange: data.exchange || '',
      industry: data.finnhubIndustry || '',
      ipo: data.ipo || '',
      marketCap: data.marketCapitalization || 0,
      phone: data.phone || '',
      shareOutstanding: data.shareOutstanding || 0,
      weburl: data.weburl || '',
    });

  } catch (error) {
    console.error('Error fetching company info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
