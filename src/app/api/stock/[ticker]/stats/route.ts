import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;

  try {
    // Fetch stock data from Yahoo Finance chart API
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1y&interval=1d`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch stats for ${ticker}`);
    }

    const data = await response.json();
    const result = data.chart.result[0];
    const meta = result.meta;
    const quotes = result.indicators.quote[0];

    // Calculate 52-week high/low from the data
    const closes = quotes.close.filter((price: number | null) => price !== null);
    const volumes = quotes.volume.filter((vol: number | null) => vol !== null);

    const fiftyTwoWeekHigh = Math.max(...closes);
    const fiftyTwoWeekLow = Math.min(...closes);
    const avgVolume = volumes.length > 0
      ? volumes.reduce((a: number, b: number) => a + b, 0) / volumes.length
      : null;

    // Extract key statistics
    const stats = {
      ticker: ticker,
      // Valuation metrics (not available in chart API, set to null)
      peRatio: null,
      eps: null,
      beta: null,
      dividendYield: null,

      // Price metrics
      fiftyTwoWeekHigh: fiftyTwoWeekHigh,
      fiftyTwoWeekLow: fiftyTwoWeekLow,
      currentPrice: meta.regularMarketPrice,

      // Volume & Trading
      volume: meta.regularMarketVolume || quotes.volume[quotes.volume.length - 1],
      avgVolume: avgVolume,
      marketCap: null,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error(`Error fetching stats for ${ticker}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch stats for ${ticker}` },
      { status: 500 }
    );
  }
}
