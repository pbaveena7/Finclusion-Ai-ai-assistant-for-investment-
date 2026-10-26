import { useState } from 'react'
import { getForecast } from '../api/client.js'
import { TrendingUp, Search, AlertCircle, Building2, ExternalLink, ShieldCheck, Zap } from 'lucide-react'

const POPULAR_SYMBOLS = [
  { symbol: 'AAPL', name: 'Apple Inc' },
  { symbol: 'NVDA', name: 'Nvidia' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'GOOGL', name: 'Alphabet' }
]

export default function FinGPTForecaster({ lang }) {
  const [symbol, setSymbol] = useState('AAPL')
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleForecast = async (tickerToUse) => {
    const sym = (tickerToUse || symbol).trim().toUpperCase()
    if (!sym) return
    setLoading(true)
    setError(null)
    setForecast(null)
    try {
      const res = await getForecast(sym)
      setForecast(res.data)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to retrieve FinGPT forecast.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded border uppercase tracking-widest flex items-center gap-1 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 bg-zinc-100 text-zinc-700 border-zinc-300">
            <Zap size={11} /> FinGPT Engine
          </span>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded border dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 bg-zinc-100 text-zinc-600 border-zinc-300">
            Market Intelligence
          </span>
        </div>
        <h1 className="text-3xl font-extrabold flex items-center gap-3 text-zinc-900 dark:text-white">
          <TrendingUp className="text-zinc-800 dark:text-zinc-300" size={28} />
          FinGPT Robo-Forecaster & Stock Intelligence
        </h1>
        <p className="text-sm mt-1 text-zinc-600 dark:text-zinc-400">
          Directly derived from the official FinGPT architecture. Combines live Finnhub market quotes, company news, and LLM reasoning.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3.5 text-zinc-400 pointer-events-none" size={17} />
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Enter ticker (e.g. AAPL, NVDA, MSFT)"
              className="input pl-11 uppercase font-mono font-semibold"
              onKeyDown={(e) => e.key === 'Enter' && handleForecast()}
            />
          </div>
          <button
            onClick={() => handleForecast()}
            disabled={loading || !symbol.trim()}
            className="btn-primary"
          >
            {loading ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>

        {/* Quick Tickers */}
        <div className="flex items-center gap-2 mt-4 text-xs overflow-x-auto pb-1">
          <span className="font-mono uppercase tracking-wider text-zinc-500">Quick:</span>
          {POPULAR_SYMBOLS.map((item) => (
            <button
              key={item.symbol}
              onClick={() => {
                setSymbol(item.symbol)
                handleForecast(item.symbol)
              }}
              className="px-2.5 py-1 rounded border font-mono text-xs transition-colors dark:bg-zinc-800 dark:border-zinc-700 dark:hover:border-zinc-500 dark:text-zinc-200 bg-zinc-100 border-zinc-300 hover:border-zinc-400 text-zinc-800"
            >
              {item.symbol}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="card border text-xs flex items-center gap-3 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 border-zinc-300 bg-zinc-100 text-zinc-800">
          <AlertCircle size={16} className="text-zinc-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Output */}
      {forecast && (
        <div className="space-y-6">
          {/* Company Card */}
          <div className="card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="text-zinc-600 dark:text-zinc-400" size={20} />
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{forecast.company_name}</h2>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded dark:bg-zinc-800 dark:text-zinc-200 bg-zinc-200 text-zinc-800">
                    {forecast.symbol}
                  </span>
                </div>
                <p className="text-xs mt-1 font-mono text-zinc-600 dark:text-zinc-400">{forecast.industry}</p>
              </div>

              {forecast.quote && forecast.quote.price && (
                <div className="text-right">
                  <div className="text-3xl font-extrabold font-mono text-zinc-900 dark:text-white">
                    ${Number(forecast.quote.price).toFixed(2)}
                  </div>
                  <div className="text-xs font-mono mt-0.5 text-zinc-600 dark:text-zinc-400">
                    {Number(forecast.quote.change) >= 0 ? '+' : ''}
                    {Number(forecast.quote.change).toFixed(2)} ({Number(forecast.quote.change_percent).toFixed(2)}%)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reasoning */}
          <div className="card">
            <div className="flex items-center justify-between border-b pb-3 mb-4 dark:border-zinc-800 border-zinc-200">
              <h3 className="text-base font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                <ShieldCheck className="text-zinc-700 dark:text-zinc-300" size={18} />
                FinGPT Structured Reasoning
              </h3>
              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                {forecast.provider}
              </span>
            </div>

            <div className="prose max-w-none text-sm leading-relaxed whitespace-pre-wrap font-sans text-zinc-800 dark:text-zinc-200">
              {forecast.analysis}
            </div>

            <div className="mt-6 pt-4 border-t dark:border-zinc-800 border-zinc-200">
              <p className="text-[11px] leading-relaxed font-mono text-zinc-600 dark:text-zinc-400">
                DISCLAIMER: {forecast.disclaimer}
              </p>
            </div>
          </div>

          {/* News Grounding */}
          {forecast.news && forecast.news.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3 font-mono text-zinc-800 dark:text-zinc-300">
                Referenced News Signals ({forecast.news.length})
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {forecast.news.map((item, idx) => (
                  <div key={idx} className="p-3.5 border rounded-xl flex flex-col justify-between dark:bg-zinc-850 dark:border-zinc-800 bg-zinc-50 border-zinc-200">
                    <div>
                      <h4 className="text-xs font-semibold line-clamp-2 leading-snug text-zinc-900 dark:text-zinc-100">
                        {item.headline}
                      </h4>
                      <p className="text-[11px] mt-1 line-clamp-2 text-zinc-600 dark:text-zinc-400">
                        {item.summary}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t text-[10px] font-mono dark:border-zinc-800 dark:text-zinc-400 border-zinc-200 text-zinc-500">
                      <span>{item.source}</span>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-1 dark:text-zinc-200 dark:hover:text-white text-zinc-800 hover:text-black font-semibold"
                        >
                          Source <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
