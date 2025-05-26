"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StockChart from "@/components/StockChart";
import PortfolioTreemap from "@/components/PortfolioTreemap";

// TypeScript interface for stock data
interface StockData {
  stock: string;
  quantity: number;
  price: number;
  market_value: number;
}

interface StockComparison extends StockData {
  current_price?: number;
  profit_loss?: number;
  percent_change?: number;
  error?: string;
  comparison_price?: number; // Price from selected period
  comparison_market_value?: number; // Market value at comparison period
}

export default function Home() {
  const [stocks, setStocks] = useState<StockComparison[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [comparisonPeriod, setComparisonPeriod] = useState<string>("csv");

  // Function to fetch stock comparison data based on selected period
  const fetchStockComparison = async (ticker: string, period: string): Promise<{currentPrice: number, comparisonPrice: number | null} | null> => {
    try {
      const response = await fetch(`/api/stock/${ticker}/compare?period=${period}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return {
        currentPrice: data.currentPrice,
        comparisonPrice: data.comparisonPrice
      };
    } catch (error) {
      console.error(`Error fetching comparison data for ${ticker}:`, error);
      return null;
    }
  };

  // Function to fetch comparison data for all stocks
  const fetchStockComparisons = async (stocksData: StockComparison[], period: string) => {
    const updatedStocks = [...stocksData];
    
    // Process stocks in parallel with a reasonable limit
    const promises = stocksData.map(async (stock, index) => {
      const comparisonData = await fetchStockComparison(stock.stock, period);
      
      if (comparisonData) {
        // Use comparison price if available, otherwise use CSV price
        const basePrice = comparisonData.comparisonPrice || stock.price;
        
        // Calculate profit/loss and percentage change
        const profitLoss = (comparisonData.currentPrice - basePrice) * stock.quantity;
        const percentChange = ((comparisonData.currentPrice - basePrice) / basePrice) * 100;
        
        updatedStocks[index] = {
          ...stock,
          current_price: comparisonData.currentPrice,
          profit_loss: profitLoss,
          percent_change: percentChange,
          comparison_price: basePrice,
          comparison_market_value: basePrice * stock.quantity
        };
      } else {
        updatedStocks[index] = {
          ...stock,
          error: `Failed to fetch data for ${stock.stock}`
        };
      }
      
      // Update state after each stock is processed for real-time updates
      setStocks([...updatedStocks]);
    });

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Error fetching stock comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle period change and refetch data
  const handlePeriodChange = (newPeriod: string) => {
    if (stocks.length > 0) {
      setComparisonPeriod(newPeriod);
      setLoading(true);
      fetchStockComparisons(stocks, newPeriod);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      setError("Please upload a CSV file");
      return;
    }

    setError("");
    setLoading(true);

    Papa.parse<StockData>(file, {
      header: true,
      skipEmptyLines: true,
      transform: (value, field) => {
        // Convert numeric fields to numbers
        if (field === "quantity" || field === "price" || field === "market_value") {
          return parseFloat(value) || 0;
        }
        return value;
      },
      complete: (results) => {
        if (results.errors.length > 0) {
          setError("Error parsing CSV: " + results.errors[0].message);
          setLoading(false);
          return;
        }

        // Validate required columns
        const requiredColumns = ["stock", "quantity", "price"];
        const data = results.data;
        
        if (data.length === 0) {
          setError("CSV file is empty");
          setLoading(false);
          return;
        }

        const firstRow = data[0];
        const missingColumns = requiredColumns.filter(col => !(col in firstRow));
        
        if (missingColumns.length > 0) {
          setError(`Missing required columns: ${missingColumns.join(", ")}`);
          setLoading(false);
          return;
        }

        // Process the data
        const stocksData: StockComparison[] = data.map(row => ({
          ...row,
          market_value: row.market_value || row.quantity * row.price
        }));

        setStocks(stocksData);
        
        // Fetch comparison data for all stocks
        fetchStockComparisons(stocksData, comparisonPeriod);
      },
      error: (error) => {
        setError("Failed to parse CSV: " + error.message);
        setLoading(false);
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-8 bg-background text-foreground">
      <main className="flex flex-col items-center gap-8 max-w-6xl w-full">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Stock Comparison App</h1>
          <p className="text-muted-foreground">
            Upload your stock portfolio CSV to compare purchase prices with current market prices
          </p>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              CSV should contain columns: stock, quantity, price, market_value (optional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={loading}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              {loading && (
                <p className="text-sm text-muted-foreground">Parsing CSV...</p>
              )}
            </div>
          </CardContent>
        </Card>

        {stocks.length > 0 && (
          <>
            {/* Treemap Visualization */}
            <PortfolioTreemap 
              stocks={stocks} 
              onStockClick={setSelectedStock} 
            />

            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Portfolio Details</CardTitle>
                  <CardDescription>
                    {stocks.length} stocks loaded. {loading ? "Fetching current prices..." : "Current prices updated."}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 mr-2">
                  <label className="text-sm font-medium">Compare to:</label>
                  <Select value={comparisonPeriod} onValueChange={handlePeriodChange} disabled={loading}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-md min-w-[200px]">
                      <SelectItem value="csv" className="pr-8">My Portfolio (CSV)</SelectItem>
                      <SelectItem value="1d" className="pr-8">1 Day Ago</SelectItem>
                      <SelectItem value="1w" className="pr-8">1 Week Ago</SelectItem>
                      <SelectItem value="1mo" className="pr-8">1 Month Ago</SelectItem>
                      <SelectItem value="3mo" className="pr-8">3 Months Ago</SelectItem>
                      <SelectItem value="ytd" className="pr-8">Year to Date</SelectItem>
                      <SelectItem value="1y" className="pr-8">1 Year Ago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stock</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>
                      {comparisonPeriod === "csv" ? "Purchase Price" : 
                       comparisonPeriod === "1d" ? "Price 1D Ago" :
                       comparisonPeriod === "1w" ? "Price 1W Ago" :
                       comparisonPeriod === "1mo" ? "Price 1M Ago" :
                       comparisonPeriod === "3mo" ? "Price 3M Ago" :
                       comparisonPeriod === "ytd" ? "Price YTD Start" :
                       comparisonPeriod === "1y" ? "Price 1Y Ago" : "Base Price"}
                    </TableHead>
                    <TableHead>
                      {comparisonPeriod === "csv" ? "Market Value" : "Market Value (Base)"}
                    </TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead>Profit/Loss</TableHead>
                    <TableHead>% Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stocks.map((stock, index) => (
                    <TableRow 
                      key={index} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedStock(stock.stock)}
                    >
                      <TableCell className="font-medium">{stock.stock}</TableCell>
                      <TableCell>{stock.quantity}</TableCell>
                      <TableCell>
                        ${(stock.comparison_price || stock.price).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        ${(stock.comparison_market_value || stock.market_value).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {stock.error ? (
                          <span className="text-destructive text-xs">Error</span>
                        ) : stock.current_price ? (
                          `$${stock.current_price.toFixed(2)}`
                        ) : (
                          <span className="text-muted-foreground">Loading...</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {stock.error ? (
                          <span className="text-destructive text-xs">-</span>
                        ) : stock.profit_loss !== undefined ? (
                          <span className={stock.profit_loss >= 0 ? "text-green-600" : "text-red-600"}>
                            ${stock.profit_loss.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {stock.error ? (
                          <span className="text-destructive text-xs">-</span>
                        ) : stock.percent_change !== undefined ? (
                          <span className={stock.percent_change >= 0 ? "text-green-600" : "text-red-600"}>
                            {stock.percent_change.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          </>
        )}

        {selectedStock && (
          <div className="w-full">
            <StockChart 
              ticker={selectedStock} 
              onClose={() => setSelectedStock(null)} 
            />
          </div>
        )}
      </main>
    </div>
  );
}
