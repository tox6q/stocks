"use client"

import { useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface StockData {
  stock: string;
  quantity: number;
  price: number;
  market_value: number;
  current_price?: number;
  profit_loss?: number;
  percent_change?: number;
  error?: string;
}

interface PortfolioTreemapProps {
  stocks: StockData[];
  onStockClick: (ticker: string) => void;
}

export default function PortfolioTreemap({ stocks, onStockClick }: PortfolioTreemapProps) {
  const validStocks = stocks.filter(stock => !stock.error && stock.current_price);
  
  const treemapData = useMemo(() => {
    if (validStocks.length === 0) return [];
    
    // Calculate total portfolio value for relative sizing
    const totalValue = validStocks.reduce((sum, stock) => sum + stock.market_value, 0);
    
    // Sort by market value (largest first) for better layout
    const sortedStocks = [...validStocks].sort((a, b) => b.market_value - a.market_value);
    
    return sortedStocks.map(stock => {
      const percentage = (stock.market_value / totalValue) * 100;
      const isPositive = (stock.percent_change || 0) >= 0;
      
      return {
        ...stock,
        percentage,
        isPositive,
        size: Math.max(percentage, 8), // Minimum 8% to ensure visibility
      };
    });
  }, [validStocks]);

  if (validStocks.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Portfolio Treemap</CardTitle>
          <CardDescription>Upload stocks with current prices to see portfolio visualization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No valid stock data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Portfolio Treemap</CardTitle>
        <CardDescription>
          Square size = Market Value • Color = Performance • Click to view chart
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] p-4 bg-muted/20 rounded-lg">
          <div className="grid grid-cols-4 gap-2 h-full">
            {treemapData.map((stock, index) => {
              const colSpan = stock.size > 40 ? 2 : 1;
              const rowSpan = stock.size > 30 ? 2 : 1;
              
              return (
                <div
                  key={stock.stock}
                  className={`
                    relative rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg
                    ${stock.isPositive 
                      ? 'bg-green-500/80 hover:bg-green-500/90' 
                      : 'bg-red-500/80 hover:bg-red-500/90'
                    }
                    ${colSpan === 2 ? 'col-span-2' : 'col-span-1'}
                    ${rowSpan === 2 ? 'row-span-2' : 'row-span-1'}
                    ${stock.size < 15 ? 'col-span-1 row-span-1' : ''}
                  `}
                  onClick={() => onStockClick(stock.stock)}
                  style={{
                    minHeight: stock.size < 15 ? '60px' : 'auto',
                  }}
                >
                  {/* Stock Content */}
                  <div className="absolute inset-0 p-2 flex flex-col justify-center items-center text-white">
                    <div className="text-center">
                      <div className="font-bold text-sm md:text-base lg:text-lg">
                        {stock.stock}
                      </div>
                      
                      {stock.size > 20 && (
                        <>
                          <div className="text-xs md:text-sm opacity-90 mt-1">
                            ${stock.market_value.toLocaleString()}
                          </div>
                          <div className="text-xs opacity-75 mt-1">
                            {stock.percent_change !== undefined ? 
                              `${stock.percent_change >= 0 ? '+' : ''}${stock.percent_change.toFixed(1)}%` 
                              : ''
                            }
                          </div>
                        </>
                      )}
                      
                      {stock.size > 35 && (
                        <div className="text-xs opacity-75 mt-1">
                          ${stock.current_price?.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Hover Tooltip */}
                  <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-black/20 rounded-lg flex items-center justify-center">
                    <div className="text-white text-xs text-center p-2">
                      <div className="font-semibold">{stock.stock}</div>
                      <div>Value: ${stock.market_value.toLocaleString()}</div>
                      <div>Price: ${stock.current_price?.toFixed(2)}</div>
                      <div>Change: {stock.percent_change?.toFixed(2)}%</div>
                      <div className="mt-1 text-xs opacity-75">Click for chart</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500/80 rounded"></div>
            <span>Profit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500/80 rounded"></div>
            <span>Loss</span>
          </div>
          <div className="text-xs">
            Square size = Market Value
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 