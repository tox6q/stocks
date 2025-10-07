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

    // Get date range (last 7 days)
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7);

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    // Fetch company news from Finnhub
    const response = await fetch(
      `https://finnhub.io/api/v1/company-news?symbol=${ticker.toUpperCase()}&from=${formatDate(fromDate)}&to=${formatDate(toDate)}&token=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch news for ${ticker}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Format and limit to 10 most recent articles
    const articles = (data || []).slice(0, 10).map((article: any) => ({
      headline: article.headline || '',
      summary: article.summary || '',
      source: article.source || '',
      url: article.url || '',
      image: article.image || '',
      datetime: article.datetime ? new Date(article.datetime * 1000).toISOString() : '',
    }));

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      articles,
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
