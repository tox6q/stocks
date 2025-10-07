"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  error?: boolean;
}

interface WatchlistStock {
  symbol: string;
  name: string;
  current_price?: number;
  percent_change?: number;
}

interface MarketOverviewProps {
  watchlist?: WatchlistStock[];
}

export default function MarketOverview({ watchlist = [] }: MarketOverviewProps) {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch("/api/market");
        const data = await response.json();
        setIndices(data.indices || []);
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && watchlist.length === 0) {
    return (
      <div className="bg-muted/30 border-b px-6 py-2">
        <div className="flex items-center gap-8">
          <span className="text-xs text-muted-foreground">Loading market data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 border-b px-6 py-2">
      <ScrollArea className="w-full">
        <div className="flex items-center gap-8 min-w-max">
          {/* Market Indices */}
          <div className="flex items-center gap-8">
            <span className="text-xs font-medium text-muted-foreground">Market</span>
            {indices.map((index) => (
              <div key={index.symbol} className="flex items-center gap-2">
                <span className="text-xs font-medium">{index.name}</span>
                <span className="text-xs font-semibold">
                  {index.price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <div
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    index.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {index.change >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>
                    {index.change >= 0 ? "+" : ""}
                    {index.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Watchlist Stocks */}
          {watchlist.length > 0 && (
            <>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-8">
                <span className="text-xs font-medium text-muted-foreground">Watchlist</span>
                {watchlist.map((stock) => (
                  <div key={stock.symbol} className="flex items-center gap-2">
                    <span className="text-xs font-medium">{stock.symbol}</span>
                    {stock.current_price !== undefined && (
                      <>
                        <span className="text-xs font-semibold">
                          ${stock.current_price.toFixed(2)}
                        </span>
                        {stock.percent_change !== undefined && (
                          <div
                            className={`flex items-center gap-0.5 text-xs font-medium ${
                              stock.percent_change >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {stock.percent_change >= 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            <span>
                              {stock.percent_change >= 0 ? "+" : ""}
                              {stock.percent_change.toFixed(2)}%
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
