"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import SearchBar from "@/components/SearchBar";
import StockChart from "@/components/StockChart";
import CompanyInfo from "@/components/CompanyInfo";
import NewsFeed from "@/components/NewsFeed";
import MarketOverview from "@/components/MarketOverview";
// import PortfolioTreemap from "@/components/PortfolioTreemap"; // Hidden but kept
import { Trash2, TrendingUp } from "lucide-react";

// TypeScript interface for watchlist stock
interface WatchlistStock {
  symbol: string;
  name: string;
  current_price?: number;
  comparison_price?: number;
  profit_loss?: number;
  percent_change?: number;
  error?: string;
}

export default function Home() {
  const [watchlist, setWatchlist] = useState<WatchlistStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [comparisonPeriod, setComparisonPeriod] = useState<string>("1mo");

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const savedWatchlist = localStorage.getItem("watchlist");
    if (savedWatchlist) {
      try {
        const parsed = JSON.parse(savedWatchlist);
        setWatchlist(parsed);
        if (parsed.length > 0) {
          fetchStockPrices(parsed, comparisonPeriod);
        }
      } catch (error) {
        console.error("Error loading watchlist:", error);
      }
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    if (watchlist.length > 0) {
      localStorage.setItem("watchlist", JSON.stringify(watchlist));
    } else {
      localStorage.removeItem("watchlist");
    }
  }, [watchlist]);

  // Function to fetch stock comparison data
  const fetchStockComparison = async (
    symbol: string,
    period: string
  ): Promise<{
    currentPrice: number;
    comparisonPrice: number | null;
  } | null> => {
    try {
      const response = await fetch(
        `/api/stock/${symbol}/compare?period=${period}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return {
        currentPrice: data.currentPrice,
        comparisonPrice: data.comparisonPrice,
      };
    } catch (error) {
      console.error(`Error fetching comparison data for ${symbol}:`, error);
      return null;
    }
  };

  // Function to fetch prices for all stocks in watchlist
  const fetchStockPrices = async (
    stocks: WatchlistStock[],
    period: string
  ) => {
    setLoading(true);
    const updatedStocks = [...stocks];

    const promises = stocks.map(async (stock, index) => {
      const comparisonData = await fetchStockComparison(stock.symbol, period);

      if (comparisonData) {
        const basePrice = comparisonData.comparisonPrice || 0;
        const profitLoss = comparisonData.currentPrice - basePrice;
        const percentChange = basePrice
          ? ((comparisonData.currentPrice - basePrice) / basePrice) * 100
          : 0;

        updatedStocks[index] = {
          ...stock,
          current_price: comparisonData.currentPrice,
          comparison_price: basePrice,
          profit_loss: profitLoss,
          percent_change: percentChange,
        };
      } else {
        updatedStocks[index] = {
          ...stock,
          error: `Failed to fetch data for ${stock.symbol}`,
        };
      }

      // Update state after each stock is processed
      setWatchlist([...updatedStocks]);
    });

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error("Error fetching stock prices:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a stock to watchlist
  const handleAddStock = (symbol: string, name: string) => {
    // Check if stock is already in watchlist
    if (watchlist.find((s) => s.symbol === symbol)) {
      return;
    }

    const newStock: WatchlistStock = {
      symbol,
      name,
    };

    const updatedWatchlist = [...watchlist, newStock];
    setWatchlist(updatedWatchlist);

    // Fetch price for the new stock
    fetchStockPrices(updatedWatchlist, comparisonPeriod);
  };

  // Handle removing a stock from watchlist
  const handleRemoveStock = (symbol: string) => {
    const updatedWatchlist = watchlist.filter((s) => s.symbol !== symbol);
    setWatchlist(updatedWatchlist);

    // If removed stock was selected, clear selection
    if (selectedStock === symbol) {
      setSelectedStock(null);
    }
  };

  // Handle period change
  const handlePeriodChange = (newPeriod: string) => {
    setComparisonPeriod(newPeriod);
    if (watchlist.length > 0) {
      fetchStockPrices(watchlist, newPeriod);
    }
  };

  return (
    <>
      <MarketOverview watchlist={watchlist} />
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
        {/* Left Sidebar - Watchlist */}
        <Sidebar className="border-r">
          <SidebarHeader className="p-4 border-b">
            <div className="mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                My Watchlist
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {watchlist.length} {watchlist.length === 1 ? "stock" : "stocks"} tracked
              </p>
            </div>
            <SearchBar onAddStock={handleAddStock} />
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>
                {loading ? "Fetching prices..." : "Stocks"}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <ScrollArea className="h-[calc(100vh-180px)]">
                  <SidebarMenu>
                    {watchlist.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground text-center">
                        No stocks yet.
                        <br />
                        Search above to add!
                      </div>
                    ) : (
                      watchlist.map((stock, index) => (
                        <SidebarMenuItem key={index}>
                          <SidebarMenuButton
                            onClick={() => setSelectedStock(stock.symbol)}
                            isActive={selectedStock === stock.symbol}
                            className="w-full"
                          >
                            <div className="flex flex-col items-start w-full gap-1.5">
                              <div className="flex justify-between w-full items-start">
                                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                  <span className="font-bold text-base">{stock.symbol}</span>
                                  <span className="text-sm text-foreground/80 truncate">
                                    {stock.name}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveStock(stock.symbol);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                              {stock.current_price && (
                                <div className="flex items-baseline gap-2 w-full">
                                  <div className="text-base font-semibold">
                                    ${stock.current_price.toFixed(2)}
                                  </div>
                                  {stock.percent_change !== undefined && (
                                    <div
                                      className={`text-sm font-medium ${
                                        stock.percent_change >= 0
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {stock.percent_change >= 0 ? "+" : ""}
                                      {stock.percent_change.toFixed(2)}%
                                    </div>
                                  )}
                                </div>
                              )}
                              {stock.error && (
                                <div className="text-xs text-destructive">Error loading</div>
                              )}
                            </div>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))
                    )}
                  </SidebarMenu>
                </ScrollArea>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Middle - Stock Details & Chart */}
          <div className="flex-1 flex flex-col">
            {/* Top Bar - Comparison Period */}
            {watchlist.length > 0 && (
              <div className="border-b px-6 py-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {selectedStock ? `${selectedStock} Details` : "Stock Dashboard"}
                </h2>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Compare to:</label>
                  <Select
                    value={comparisonPeriod}
                    onValueChange={handlePeriodChange}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-md">
                      <SelectItem value="1d">1 Day Ago</SelectItem>
                      <SelectItem value="1w">1 Week Ago</SelectItem>
                      <SelectItem value="1mo">1 Month Ago</SelectItem>
                      <SelectItem value="3mo">3 Months Ago</SelectItem>
                      <SelectItem value="ytd">Year to Date</SelectItem>
                      <SelectItem value="1y">1 Year Ago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-auto">
              <div className="p-6">
                {!selectedStock ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                    <Card className="max-w-md">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Stock Dashboard</h3>
                        <p className="text-muted-foreground text-center text-sm">
                          Search and add stocks to your watchlist, then click on a stock to
                          view details, charts, and news.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Company Info with Key Statistics */}
                    <CompanyInfo ticker={selectedStock} />

                    {/* Stock Chart */}
                    <StockChart
                      ticker={selectedStock}
                      onClose={() => setSelectedStock(null)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right - News Feed */}
          {selectedStock && (
            <div className="w-80 border-l p-4 overflow-auto h-screen">
              <NewsFeed ticker={selectedStock} />
            </div>
          )}
        </div>
      </div>
      </SidebarProvider>
    </>
  );
}
