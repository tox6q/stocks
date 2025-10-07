# Stock Dashboard - Development Notes

## Project Overview
A modern stock watchlist dashboard built with Next.js, TypeScript, and shadcn/ui. Showcases multiple financial data APIs with real-time pricing, company information, news feeds, and interactive charts.

## Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Charts**: Recharts
- **APIs**: Yahoo Finance (prices/search), Finnhub (company data/news)

## Key Features
1. **Stock Search** - Autocomplete search with Yahoo Finance API
2. **Watchlist Management** - Add/remove stocks, persists to localStorage
3. **Price Tracking** - Real-time prices with comparison periods (1D, 1W, 1M, 3M, YTD, 1Y)
4. **Interactive Charts** - Historical price data with multiple timeframes
5. **Company Information** - Logo, industry, market cap, country, exchange (via Finnhub)
6. **News Feed** - Latest articles with images and sources (via Finnhub)

## Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── search/route.ts              # Stock search endpoint
│   │   ├── stock/[ticker]/
│   │   │   ├── route.ts                 # Basic stock data
│   │   │   ├── compare/route.ts         # Price comparison
│   │   │   └── history/route.ts         # Historical data
│   │   ├── company/[ticker]/route.ts    # Finnhub company profile
│   │   └── news/[ticker]/route.ts       # Finnhub news articles
│   ├── layout.tsx
│   └── page.tsx                         # Main dashboard page
├── components/
│   ├── ui/                              # shadcn components
│   ├── SearchBar.tsx                    # Stock search with autocomplete
│   ├── CompanyInfo.tsx                  # Company profile card
│   ├── NewsFeed.tsx                     # News articles feed
│   ├── StockChart.tsx                   # Price chart component
│   └── PortfolioTreemap.tsx             # (Hidden) Treemap visualization
└── lib/
```

## API Endpoints

### Stock Search
- **GET** `/api/search?q={query}`
- Returns: Array of stock results with symbol, name, exchange

### Stock Comparison
- **GET** `/api/stock/{ticker}/compare?period={period}`
- Periods: `1d`, `1w`, `1mo`, `3mo`, `ytd`, `1y`
- Returns: Current price + comparison price for selected period

### Stock History
- **GET** `/api/stock/{ticker}/history?range={range}`
- Ranges: `1d`, `5d`, `1mo`, `3mo`, `1y`
- Returns: Array of date/price data for charting

### Company Profile
- **GET** `/api/company/{ticker}`
- Returns: Name, logo, industry, market cap, country, exchange, website (Finnhub)

### Company News
- **GET** `/api/news/{ticker}`
- Returns: Array of recent news articles with headlines, summaries, images (Finnhub)

## Environment Variables
```env
FINNHUB_API_KEY=your_api_key_here
```

Get your free API key at: https://finnhub.io/register

## Data Flow
1. User searches for stock → Yahoo Finance search API
2. User adds to watchlist → Saves to localStorage
3. Fetch prices → Yahoo Finance chart API with period comparison
4. User clicks stock → Shows:
   - Chart (Yahoo Finance historical data)
   - Company info (Finnhub profile API)
   - News feed (Finnhub news API)

## Key Design Decisions

### Why Yahoo Finance for Prices?
- Free, no API key required
- Good historical data
- Works without CORS issues via Next.js API routes

### Why Finnhub for Company Data?
- Free tier includes company profiles and news
- Good logo/image quality
- Reliable news feed with 7-day history

### Why Next.js API Routes?
- Solves CORS issues with external APIs
- Keeps API keys secure (server-side only)
- Easy to add rate limiting/caching later

### Watchlist Storage
- Uses localStorage for simplicity
- No backend/database needed for demo
- Easy to migrate to database later

## Component Highlights

### SearchBar
- Debounced search (300ms)
- Click-outside to close dropdown
- Shows symbol, name, exchange
- Prevents duplicate additions

### CompanyInfo
- Displays company logo with fallback
- Formats market cap (B/T)
- Links to company website
- Handles missing data gracefully

### NewsFeed
- Shows 10 most recent articles
- Relative timestamps (e.g., "2h ago")
- External link with icon
- Image fallback handling

### StockChart
- Multiple timeframes (1D, 5D, 1M, 3M, 1Y)
- Color-coded gains/losses (green/red)
- Shows current price + period change
- Responsive design

## Future Enhancements (Phase 2+)
- [ ] Add Alpha Vantage for technical indicators (RSI, MACD)
- [ ] Crypto/Forex support toggle
- [ ] Real-time WebSocket price updates
- [ ] Portfolio tracking with quantities
- [ ] Export watchlist to CSV
- [ ] Dark/light mode toggle
- [ ] Price alerts
- [ ] Backend database integration
- [ ] User authentication

## Development Commands
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm start       # Start production server
npm run lint    # Run ESLint
```

## Notes
- CSV upload feature removed (code in git history if needed)
- Treemap component hidden but kept in codebase (line 31 in page.tsx)
- Yahoo Finance API is unofficial but stable
- Finnhub free tier: 60 API calls/minute

## API Showcasing Strategy
This dashboard demonstrates API capabilities by:
1. **Search** - Shows autocomplete/lookup functionality
2. **Prices** - Real-time + historical data retrieval
3. **Company Data** - Rich metadata (logos, sectors, market cap)
4. **News** - Alternative data sources
5. **Comparisons** - Historical period analysis

Perfect for presenting to stakeholders what financial APIs can provide!
