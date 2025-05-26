TODO: Stock Comparison App

Install dependencies:
[x]Run npm install papaparse @types/papaparse for CSV parsing.
[x]Install shadcn/ui CLI: npx shadcn-ui@latest init.
[x]Add shadcn/ui components: npx shadcn-ui@latest add button table input.
[x]Ensure Tailwind CSS is configured for shadcn/ui styling.

Development

[x]Create main component (src/App.tsx):
[x]Add file upload input for CSV using shadcn/ui Input component.
[x]Use papaparse to parse CSV with columns: stock (ticker), quantity, price, market_value.
[x]Define TypeScript interface for stock data: { stock: string; quantity: number; price: number; market_value: number }.

Implement Yahoo Finance API integration:
[x]Write a function to fetch current price for a ticker using fetch from https://query1.finance.yahoo.com/v8/finance/chart/{ticker}.
[x]Extract regularMarketPrice from API response.
[x]Handle errors (e.g., invalid ticker, API rate limits).


 Calculate comparison metrics:
[x]Compute profit/loss: (current_price - price) * quantity.
[x]Compute percentage change: ((current_price - price) / price) * 100.


 Display results:
[x]Use shadcn/ui Table component to show columns: stock, quantity, price, current_price, profit_loss, percent_change.
[x]Add basic error messages for invalid CSV or API failures using shadcn/ui Button for feedback.

Testing

 Test CSV parsing:
[x]Create a sample CSV (stocks.csv) with columns: stock,quantity,price,market_value.
[]Verify parsing handles valid and invalid CSVs.


 Test API calls:
[]Ensure current prices are fetched for valid tickers (e.g., AAPL, GOOGL).
[]Check error handling for invalid tickers or API failures.


 Test UI:
[]Confirm shadcn/ui table displays data correctly with Tailwind styling.
[]Verify file upload and error messages work as expected.

Notes

Use shadcn/ui for consistent, Tailwind-based design (e.g., Button for upload, Table for results).
Monitor Yahoo Finance API for CORS issues; consider a Node.js proxy if needed.
Keep app minimal

Sample CSV format:
stock,quantity,price,market_value
AAPL,10.00,150.00,1500.00
GOOGL,5.00,100.00,500.00



