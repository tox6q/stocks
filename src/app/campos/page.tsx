'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'

interface CampoData {
  campo: string
  apiSource: string
  value: string | number | null
  status: '✅' | '💰' | '❌' | '🔄'
  statusText: 'Available (Free)' | 'Paid API Required' | 'Not Available' | 'To Implement'
}

export default function CamposPage() {
  const [ticker, setTicker] = useState('AAPL')
  const [searchValue, setSearchValue] = useState('AAPL')
  const [loading, setLoading] = useState(false)
  const [campos, setCampos] = useState<CampoData[]>([])

  const allCampos: Omit<CampoData, 'value'>[] = [
    // IMPLEMENTED - Current Price & Date
    { campo: 'FechaActual (Current Date)', apiSource: 'System/Yahoo Finance', status: '✅', statusText: 'Available (Free)' },
    { campo: 'PrLast (Last Price)', apiSource: 'Yahoo Finance', status: '✅', statusText: 'Available (Free)' },

    // IMPLEMENTED - Company Info
    { campo: 'CompanyName', apiSource: 'Finnhub', status: '✅', statusText: 'Available (Free)' },
    { campo: 'SubSectorName (Industry)', apiSource: 'Finnhub', status: '✅', statusText: 'Available (Free)' },
    { campo: 'Sector', apiSource: 'Finnhub', status: '✅', statusText: 'Available (Free)' },
    { campo: 'Country/Geo', apiSource: 'Finnhub', status: '✅', statusText: 'Available (Free)' },
    { campo: 'Exchange', apiSource: 'Finnhub', status: '✅', statusText: 'Available (Free)' },
    { campo: 'MarketCap', apiSource: 'Finnhub', status: '✅', statusText: 'Available (Free)' },
    { campo: 'WebURL', apiSource: 'Finnhub', status: '✅', statusText: 'Available (Free)' },

    // TO IMPLEMENT - Price & Performance Metrics
    { campo: 'HiPr (52W High)', apiSource: 'Yahoo Finance', status: '🔄', statusText: 'To Implement' },
    { campo: 'LowPr (52W Low)', apiSource: 'Yahoo Finance', status: '🔄', statusText: 'To Implement' },
    { campo: 'CligrFtTd (Chg Today)', apiSource: 'Yahoo Finance', status: '🔄', statusText: 'To Implement' },
    { campo: 'CligrFt1Yr (Chg 1Y)', apiSource: 'Yahoo Finance', status: '🔄', statusText: 'To Implement' },
    { campo: 'CligrFt3M (Chg 3M)', apiSource: 'Yahoo Finance', status: '🔄', statusText: 'To Implement' },
    { campo: 'YtdYearMid (YTD Return)', apiSource: 'Yahoo Finance', status: '🔄', statusText: 'To Implement' },

    // TO IMPLEMENT - Volatility & Risk
    { campo: 'Volatility3600 (Volatility)', apiSource: 'Alpha Vantage', status: '🔄', statusText: 'To Implement' },
    { campo: 'EqyBeta (Beta)', apiSource: 'Yahoo Finance/Finnhub', status: '🔄', statusText: 'To Implement' },
    { campo: 'VaR (Value at Risk)', apiSource: 'Alpha Vantage', status: '💰', statusText: 'Paid API Required' },

    // TO IMPLEMENT - Style & Classification
    { campo: 'Size (Market Size)', apiSource: 'Morningstar/Finnhub', status: '🔄', statusText: 'To Implement' },
    { campo: 'Style (Growth/Value)', apiSource: 'Morningstar', status: '💰', statusText: 'Paid API Required' },

    // TO IMPLEMENT - Dividends
    { campo: 'DvdYield (Dividend Yield)', apiSource: 'Finnhub/Yahoo', status: '🔄', statusText: 'To Implement' },
    { campo: 'DvdRatingNet', apiSource: 'Finnhub', status: '🔄', statusText: 'To Implement' },
    { campo: 'DvdDivLast3', apiSource: 'Finnhub', status: '🔄', statusText: 'To Implement' },
    { campo: 'DvdPrcgrDt (Ex-Div Date)', apiSource: 'Finnhub', status: '🔄', statusText: 'To Implement' },

    // TO IMPLEMENT - Technical Indicators
    { campo: 'IdxTfRo (Technical Rating)', apiSource: 'Alpha Vantage', status: '🔄', statusText: 'To Implement' },
    { campo: 'IR1Yr (Information Ratio)', apiSource: 'Alpha Vantage', status: '💰', statusText: 'Paid API Required' },

    // TO IMPLEMENT - Identifiers & Codes
    { campo: 'FactsetCode', apiSource: 'FactSet', status: '💰', statusText: 'Paid API Required' },
    { campo: 'MediCoe (CUSIP/ISIN)', apiSource: 'Finnhub/OpenFIGI', status: '🔄', statusText: 'To Implement' },
    { campo: 'GcisId (GICS Code)', apiSource: 'Finnhub', status: '🔄', statusText: 'To Implement' },

    // TO IMPLEMENT - Fixed Income (Bonds)
    { campo: 'RtgMoody (Moody Rating)', apiSource: 'FactSet/Bloomberg', status: '💰', statusText: 'Paid API Required' },
    { campo: 'Cpn (Coupon)', apiSource: 'FactSet', status: '💰', statusText: 'Paid API Required' },
    { campo: 'NxtCpnDt (Next Coupon Date)', apiSource: 'FactSet', status: '💰', statusText: 'Paid API Required' },
    { campo: 'Maturity', apiSource: 'FactSet', status: '💰', statusText: 'Paid API Required' },
    { campo: 'Callable', apiSource: 'FactSet', status: '💰', statusText: 'Paid API Required' },

    // TO IMPLEMENT - Holdings & Fundamentals
    { campo: 'Holdings (Top Holdings)', apiSource: 'Finnhub/Morningstar', status: '💰', statusText: 'Paid API Required' },
    { campo: 'PctRatio (P/E Ratio)', apiSource: 'Finnhub/Yahoo', status: '🔄', statusText: 'To Implement' },

    // COMPLEX - Proprietary/Internal Data
    { campo: 'EarlyCurry', apiSource: 'Internal Calculation', status: '❌', statusText: 'Not Available' },
    { campo: 'EqaPctNetw', apiSource: 'Internal Calculation', status: '❌', statusText: 'Not Available' },
    { campo: 'GcIsInstrName', apiSource: 'Internal/FactSet', status: '❌', statusText: 'Not Available' },
    { campo: 'MpRatingMidCd', apiSource: 'Internal Rating', status: '❌', statusText: 'Not Available' },
    { campo: 'GcIsSeniority', apiSource: 'FactSet', status: '❌', statusText: 'Not Available' },
    { campo: 'Pledge', apiSource: 'Internal', status: '❌', statusText: 'Not Available' },
  ]

  const fetchStockData = async (symbol: string) => {
    setLoading(true)
    try {
      // Fetch from existing APIs
      const [priceRes, companyRes] = await Promise.all([
        fetch(`/api/stock/${symbol}`),
        fetch(`/api/company/${symbol}`)
      ])

      const priceData = await priceRes.json()
      const companyData = await companyRes.json()

      // Map the data to campos
      const updatedCampos: CampoData[] = allCampos.map(campo => {
        let value: string | number | null = null

        // Implemented fields
        if (campo.campo === 'FechaActual (Current Date)') {
          value = new Date().toLocaleDateString()
        } else if (campo.campo === 'PrLast (Last Price)') {
          value = priceData.currentPrice ? `$${priceData.currentPrice.toFixed(2)}` : null
        } else if (campo.campo === 'CompanyName') {
          value = companyData.name || null
        } else if (campo.campo === 'SubSectorName (Industry)') {
          value = companyData.industry || null
        } else if (campo.campo === 'Sector') {
          value = companyData.industry?.split(' ')[0] || null
        } else if (campo.campo === 'Country/Geo') {
          value = companyData.country || null
        } else if (campo.campo === 'Exchange') {
          value = companyData.exchange || null
        } else if (campo.campo === 'MarketCap') {
          value = companyData.marketCap
            ? `$${(companyData.marketCap / 1000).toFixed(2)}B`
            : null
        } else if (campo.campo === 'WebURL') {
          value = companyData.weburl || null
        } else {
          // Not yet implemented - show placeholder
          value = campo.status === '🔄' ? 'Coming soon...' :
                  campo.status === '💰' ? 'Paid API needed' :
                  campo.status === '❌' ? 'Not available via API' : null
        }

        return {
          ...campo,
          value
        }
      })

      setCampos(updatedCampos)
    } catch (error) {
      console.error('Error fetching stock data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (searchValue.trim()) {
      setTicker(searchValue.toUpperCase())
    }
  }

  useEffect(() => {
    if (ticker) {
      fetchStockData(ticker)
    }
  }, [ticker])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Database Field Mapper</h1>
          <p className="text-muted-foreground">
            Proof of concept: Replace database campos with API calls
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Enter stock ticker (e.g., AAPL, GOOGL, TSLA)"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors"
          >
            Search
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {campos.filter(c => c.status === '✅').length}
            </div>
            <div className="text-sm text-muted-foreground">Available (Free)</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {campos.filter(c => c.status === '🔄').length}
            </div>
            <div className="text-sm text-muted-foreground">To Implement</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {campos.filter(c => c.status === '💰').length}
            </div>
            <div className="text-sm text-muted-foreground">Paid API</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">
              {campos.filter(c => c.status === '❌').length}
            </div>
            <div className="text-sm text-muted-foreground">Not Available</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Database Campo
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    API Source
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Value ({ticker})
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      Loading data for {ticker}...
                    </td>
                  </tr>
                ) : campos.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      Enter a stock ticker to see field mappings
                    </td>
                  </tr>
                ) : (
                  campos.map((campo, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {campo.campo}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {campo.apiSource}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {campo.value || <span className="text-muted-foreground italic">No data</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            campo.status === '✅'
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : campo.status === '🔄'
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : campo.status === '💰'
                              ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                              : 'bg-red-100 text-red-700 border border-red-200'
                          }`}
                        >
                          {campo.status} {campo.statusText}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>✅</span> Available with free APIs
          </div>
          <div className="flex items-center gap-2">
            <span>🔄</span> To implement (free APIs exist)
          </div>
          <div className="flex items-center gap-2">
            <span>💰</span> Requires paid API subscription
          </div>
          <div className="flex items-center gap-2">
            <span>❌</span> Not available via public APIs
          </div>
        </div>
      </div>
    </div>
  )
}
