"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Globe, TrendingUp } from "lucide-react";

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

interface CompanyInfoProps {
  ticker: string;
}

export default function CompanyInfo({ ticker }: CompanyInfoProps) {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/company/${ticker}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch company info`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setCompany(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load company info");
      } finally {
        setLoading(false);
      }
    };

    if (ticker) {
      fetchCompanyInfo();
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

  return (
    <Card>
      <CardContent className="p-4">
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
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
      </CardContent>
    </Card>
  );
}
