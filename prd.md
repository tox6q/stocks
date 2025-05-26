Stock Comparison App PRD
Overview
A simple web application that allows users to upload a CSV file containing stock purchase data (stock ticker, quantity, purchase price, market value) and compares the purchase price with the current market price using the Yahoo Finance API.
Objectives

Enable users to upload a CSV file with stock data.
Fetch current stock prices from Yahoo Finance.
Display a table comparing purchase prices with current prices, including profit/loss.
Ensure a simple, user-friendly interface. USE SHADCN

Functional Requirements

CSV Upload:
Accept a CSV file with columns: stock (ticker, e.g., AAPL), quantity (number of shares), price (purchase price per share), market_value (optional, calculated as quantity * price).
Parse the CSV file client-side using papaparse.


Stock Price Fetching:
Retrieve current stock prices for each ticker using the Yahoo Finance API (query1.finance.yahoo.com/v8/finance/chart/{ticker}).
Handle API errors gracefully (e.g., invalid ticker, rate limits).


Comparison Logic:
Calculate profit/loss: (current_price - purchase_price) * quantity.
Display percentage change: ((current_price - purchase_price) / purchase_price) * 100.


User Interface:
File upload input for CSV.
Table displaying: ticker, quantity, purchase price, current price, profit/loss, percentage change.
Basic error messages for invalid CSV or API failures.


Performance:
Process CSVs with up to 100 rows efficiently.
Fetch stock prices in parallel where possible.


Out of Scope

Real-time stock price updates (only fetches on upload).
Advanced visualizations (e.g., charts).
User accounts or data persistence.