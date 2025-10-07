import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch data for major indices: S&P 500, NASDAQ, DOW
    const indices = [
      { symbol: "^GSPC", name: "S&P 500" },
      { symbol: "^IXIC", name: "NASDAQ" },
      { symbol: "^DJI", name: "DOW" },
    ];

    const results = await Promise.all(
      indices.map(async (index) => {
        try {
          const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${index.symbol}?interval=1d&range=5d`,
            {
              headers: {
                "User-Agent": "Mozilla/5.0",
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch ${index.name}`);
          }

          const data = await response.json();
          const result = data.chart.result[0];
          const meta = result.meta;
          const quotes = result.indicators.quote[0];
          const timestamps = result.timestamp;

          // Get current price
          const currentPrice = meta.regularMarketPrice;

          // Get previous close
          const previousClose = meta.chartPreviousClose;

          // Calculate change
          const change = currentPrice - previousClose;
          const changePercent = (change / previousClose) * 100;

          return {
            symbol: index.symbol,
            name: index.name,
            price: currentPrice,
            change: change,
            changePercent: changePercent,
          };
        } catch (error) {
          console.error(`Error fetching ${index.name}:`, error);
          return {
            symbol: index.symbol,
            name: index.name,
            price: 0,
            change: 0,
            changePercent: 0,
            error: true,
          };
        }
      })
    );

    return NextResponse.json({ indices: results });
  } catch (error) {
    console.error("Error fetching market data:", error);
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
}
