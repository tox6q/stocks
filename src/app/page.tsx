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
import StockChart from "@/components/StockChart";

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
}

export default function Home() {
  const [stocks, setStocks] = useState<StockComparison[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

  // Function to fetch current stock price using our API route
  const fetchStockPrice = async (ticker: string): Promise<number | null> => {
    try {
      const response = await fetch(`/api/stock/${ticker}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data.currentPrice;
    } catch (error) {
      console.error(`Error fetching price for ${ticker}:`, error);
      return null;
    }
  };

  // Function to fetch current prices for all stocks
  const fetchCurrentPrices = async (stocksData: StockComparison[]) => {
    const updatedStocks = [...stocksData];
    
    // Process stocks in parallel with a reasonable limit
    const promises = stocksData.map(async (stock, index) => {
      const currentPrice = await fetchStockPrice(stock.stock);
      
      if (currentPrice !== null) {
        // Calculate profit/loss and percentage change
        const profitLoss = (currentPrice - stock.price) * stock.quantity;
        const percentChange = ((currentPrice - stock.price) / stock.price) * 100;
        
        updatedStocks[index] = {
          ...stock,
          current_price: currentPrice,
          profit_loss: profitLoss,
          percent_change: percentChange
        };
      } else {
        updatedStocks[index] = {
          ...stock,
          error: `Failed to fetch price for ${stock.stock}`
        };
      }
      
      // Update state after each stock is processed for real-time updates
      setStocks([...updatedStocks]);
    });

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Error fetching stock prices:', error);
    } finally {
      setLoading(false);
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
        
        // Fetch current prices for all stocks
        fetchCurrentPrices(stocksData);
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
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Portfolio Overview</CardTitle>
              <CardDescription>
                {stocks.length} stocks loaded. {loading ? "Fetching current prices..." : "Current prices updated."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stock</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Purchase Price</TableHead>
                    <TableHead>Market Value</TableHead>
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
                      <TableCell>${stock.price.toFixed(2)}</TableCell>
                      <TableCell>${stock.market_value.toFixed(2)}</TableCell>
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
