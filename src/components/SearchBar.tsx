"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Plus } from "lucide-react";

interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

interface SearchBarProps {
  onAddStock: (symbol: string, name: string) => void;
}

export default function SearchBar({ onAddStock }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim().length > 0) {
        searchStocks(query);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const searchStocks = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data.results) {
        setResults(data.results);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Error searching stocks:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = (result: SearchResult) => {
    onAddStock(result.symbol, result.name);
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search stocks (e.g., AAPL, TSLA, GOOGL)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setShowResults(true);
          }}
          className="pl-10 pr-4 h-12 text-base"
        />
      </div>

      {showResults && results.length > 0 && (
        <Card className="absolute z-50 w-full mt-2 max-h-96 overflow-y-auto shadow-lg">
          <div className="p-2">
            {loading && (
              <div className="p-4 text-center text-muted-foreground">
                Searching...
              </div>
            )}
            {!loading && results.map((result) => (
              <button
                key={result.symbol}
                onClick={() => handleAddStock(result)}
                className="w-full flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors text-left group"
              >
                <div className="flex-1">
                  <div className="font-semibold text-sm">{result.symbol}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {result.name}
                  </div>
                  {result.exchange && (
                    <div className="text-xs text-muted-foreground">
                      {result.exchange}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </button>
            ))}
          </div>
        </Card>
      )}

      {showResults && !loading && results.length === 0 && query.trim() && (
        <Card className="absolute z-50 w-full mt-2 shadow-lg">
          <div className="p-4 text-center text-muted-foreground">
            No results found
          </div>
        </Card>
      )}
    </div>
  );
}
