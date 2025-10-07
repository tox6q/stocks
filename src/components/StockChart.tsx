"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"

interface StockChartData {
  date: string;
  price: number;
}

interface StockChartProps {
  ticker: string;
  onClose: () => void;
}

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--chart-1))",
  },
  priceUp: {
    label: "Price",
    color: "hsl(142 71% 45%)", // Green color
  },
  priceDown: {
    label: "Price", 
    color: "hsl(0 84% 60%)", // Red color
  },
} satisfies ChartConfig

export default function StockChart({ ticker, onClose }: StockChartProps) {
  const [chartData, setChartData] = useState<StockChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [range, setRange] = useState("1mo");

  const fetchChartData = async (selectedRange: string) => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`/api/stock/${ticker}/history?range=${selectedRange}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chart data: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setChartData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chart data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData(range);
  }, [ticker, range]);

  const handleRangeChange = (newRange: string) => {
    setRange(newRange);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1]?.price : 0;
  const firstPrice = chartData.length > 0 ? chartData[0]?.price : 0;
  const previousPrice = chartData.length > 1 ? chartData[chartData.length - 2]?.price : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const percentChange = previousPrice ? (priceChange / previousPrice) * 100 : 0;
  
  // Calculate overall trend for the selected period
  const overallChange = currentPrice - firstPrice;
  const isPositive = overallChange >= 0;
  const chartColor = isPositive ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)";

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-baseline gap-4">
          <div>
            <CardTitle className="text-xl font-bold">{ticker}</CardTitle>
            {!loading && !error && (
              <div className="text-2xl font-bold mt-1">
                ${currentPrice.toFixed(2)}
              </div>
            )}
          </div>
          {!loading && !error && (
            <div>
              <div className={`text-sm font-medium ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} ({percentChange.toFixed(2)}%)
              </div>
              <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                Period: {isPositive ? '+' : ''}${overallChange.toFixed(2)} ({firstPrice ? ((overallChange / firstPrice) * 100).toFixed(2) : '0.00'}%)
              </div>
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </CardHeader>

      {!loading && !error && (
        <div className="px-6 pb-2">
          <div className="flex gap-2">
            {[
              { label: "1D", value: "1d" },
              { label: "5D", value: "5d" },
              { label: "1M", value: "1mo" },
              { label: "3M", value: "3mo" },
              { label: "1Y", value: "1y" },
            ].map((option) => (
              <Button
                key={option.value}
                variant={range === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleRangeChange(option.value)}
                disabled={loading}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <CardContent className="pt-2">
        {loading && (
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading chart data...</p>
          </div>
        )}

        {error && (
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {!loading && !error && chartData.length > 0 && (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart
              accessibilityLayer
              data={chartData}
              width="100%"
              height={250}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatDate}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={['dataMin - 5', 'dataMax + 5']}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
                formatter={(value, name) => [
                  `$${Number(value).toFixed(2)}`,
                  "Price"
                ]}
                labelFormatter={(value) => {
                  return new Date(value).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                }}
              />
              <Area
                dataKey="price"
                type="monotone"
                fill={chartColor}
                fillOpacity={0.4}
                stroke={chartColor}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
} 