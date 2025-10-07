"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface StockStats {
  ticker: string;
  peRatio: number | null;
  eps: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  currentPrice: number | null;
  volume: number | null;
  avgVolume: number | null;
  beta: number | null;
  dividendYield: number | null;
  marketCap: number | null;
}

interface KeyStatsProps {
  ticker: string;
}

export default function KeyStats({ ticker }: KeyStatsProps) {
  const [stats, setStats] = useState<StockStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/stock/${ticker}/stats`);

        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stats");
      } finally {
        setLoading(false);
      }
    };

    if (ticker) {
      fetchStats();
    }
  }, [ticker]);

  const formatNumber = (num: number | null, decimals = 2) => {
    if (num === null || num === undefined) return "N/A";
    return num.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatVolume = (volume: number | null) => {
    if (volume === null || volume === undefined) return "N/A";
    if (volume >= 1000000000) {
      return `${(volume / 1000000000).toFixed(2)}B`;
    } else if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(2)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(2)}K`;
    }
    return volume.toString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Key Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Loading stats...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Key Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-destructive">{error || "No stats available"}</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate 52-week range percentage
  const rangePercent =
    stats.currentPrice &&
    stats.fiftyTwoWeekHigh &&
    stats.fiftyTwoWeekLow
      ? ((stats.currentPrice - stats.fiftyTwoWeekLow) /
          (stats.fiftyTwoWeekHigh - stats.fiftyTwoWeekLow)) *
        100
      : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Key Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-muted-foreground font-medium mb-1">52W High</div>
            <div className="font-semibold">
              {stats.fiftyTwoWeekHigh !== null
                ? `$${formatNumber(stats.fiftyTwoWeekHigh)}`
                : "N/A"}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground font-medium mb-1">52W Low</div>
            <div className="font-semibold">
              {stats.fiftyTwoWeekLow !== null
                ? `$${formatNumber(stats.fiftyTwoWeekLow)}`
                : "N/A"}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground font-medium mb-1">52W Range</div>
            <div className="font-semibold">
              {rangePercent !== null ? `${formatNumber(rangePercent, 0)}%` : "N/A"}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground font-medium mb-1">Current Price</div>
            <div className="font-semibold">
              {stats.currentPrice !== null
                ? `$${formatNumber(stats.currentPrice)}`
                : "N/A"}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground font-medium mb-1">Volume</div>
            <div className="font-semibold">{formatVolume(stats.volume)}</div>
          </div>

          <div>
            <div className="text-muted-foreground font-medium mb-1">Avg Volume</div>
            <div className="font-semibold">{formatVolume(stats.avgVolume)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
