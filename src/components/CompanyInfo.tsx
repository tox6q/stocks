"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Globe, TrendingUp, BarChart3 } from "lucide-react";

interface CompanyData {
  ticker: string;
  name: string;
  logo: string;
  country: string;
  currency: string;
  exchange: string;
  industry: string;
  ipo: string;
  marketCap: number;
  weburl: string;
}

interface StockStats {
  ticker: string;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  currentPrice: number | null;
  volume: number | null;
  avgVolume: number | null;
}

interface CompanyInfoProps {
  ticker: string;
}

export default function CompanyInfo({ ticker }: CompanyInfoProps) {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [stats, setStats] = useState<StockStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        // Fetch company info and stats in parallel
        const [companyResponse, statsResponse] = await Promise.all([
          fetch(`/api/company/${ticker}`),
          fetch(`/api/stock/${ticker}/stats`),
        ]);

        if (!companyResponse.ok) {
          throw new Error(`Failed to fetch company info`);
        }

        const companyData = await companyResponse.json();
        if (companyData.error) {
          throw new Error(companyData.error);
        }
        setCompany(companyData);

        // Stats might fail, handle gracefully
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (!statsData.error) {
            setStats(statsData);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load company info");
      } finally {
        setLoading(false);
      }
    };

    if (ticker) {
      fetchData();
    }
  }, [ticker]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-muted-foreground text-sm">Loading company info...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !company) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-destructive text-sm">{error || "No company info available"}</p>
        </CardContent>
      </Card>
    );
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(2)}T`;
    } else if (marketCap >= 1) {
      return `$${marketCap.toFixed(2)}B`;
    } else {
      return `$${(marketCap * 1000).toFixed(2)}M`;
    }
  };

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

  // Calculate 52-week range percentage
  const rangePercent =
    stats?.currentPrice &&
    stats?.fiftyTwoWeekHigh &&
    stats?.fiftyTwoWeekLow
      ? ((stats.currentPrice - stats.fiftyTwoWeekLow) /
          (stats.fiftyTwoWeekHigh - stats.fiftyTwoWeekLow)) *
        100
      : null;

  return (
    <Card>
      <CardContent className="p-4">
        {/* Company Info Section */}
        <div className="flex items-center gap-4 mb-3">
          {company.logo && (
            <img
              src={company.logo}
              alt={`${company.name} logo`}
              className="w-12 h-12 rounded-lg object-contain bg-white p-1.5 flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold truncate">{company.name}</h3>
            <p className="text-sm text-muted-foreground">{company.ticker}</p>
          </div>
          {company.weburl && (
            <a
              href={company.weburl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline flex-shrink-0"
            >
              Website
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-4">
          <div>
            <div className="font-medium text-muted-foreground">Industry</div>
            <div className="font-semibold truncate">{company.industry || "N/A"}</div>
          </div>

          <div>
            <div className="font-medium text-muted-foreground">Market Cap</div>
            <div className="font-semibold">
              {company.marketCap > 0 ? formatMarketCap(company.marketCap) : "N/A"}
            </div>
          </div>

          <div>
            <div className="font-medium text-muted-foreground">Country</div>
            <div className="font-semibold">{company.country || "N/A"}</div>
          </div>

          <div>
            <div className="font-medium text-muted-foreground">Exchange</div>
            <div className="font-semibold">{company.exchange || "N/A"}</div>
          </div>
        </div>

        {/* Key Statistics Section */}
        {stats && (
          <>
            <div className="border-t pt-3 mb-3">
              <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4" />
                Key Statistics
              </h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
