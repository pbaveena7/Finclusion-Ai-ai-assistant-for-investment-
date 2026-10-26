import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { getStockQuote } from '../api/client.js'

const DEFAULT_TICKERS = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'NVDA', name: 'Nvidia' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'GOOGL', name: 'Google' },
  { symbol: 'META', name: 'Meta' },
]

export default function StockTickerBar() {
  const [quotes, setQuotes] = useState([])

  useEffect(() => {
    let isMounted = true
    const fetchInitialQuotes = async () => {
      const results = await Promise.all(
        DEFAULT_TICKERS.map(async (item) => {
          try {
            const res = await getStockQuote(item.symbol)
            return { ...item, ...res.data }
          } catch {
            return { ...item, price: null, change: null, change_percent: null }
          }
        })
      )
      if (isMounted) setQuotes(results)
    }
    fetchInitialQuotes()
    return () => { isMounted = false }
  }, [])

  const displayList = [...quotes, ...quotes]

  return (
    <div className="w-full border-b border-zinc-800/80 bg-zinc-950/80 dark:bg-black/90 dark:border-zinc-900 overflow-hidden py-2 backdrop-blur-md">
      <div className="flex items-center">
        <div className="px-3 shrink-0 flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase border-r border-zinc-800/60 dark:border-zinc-800 z-10 bg-zinc-950/90 dark:bg-black">
          <Activity size={12} className="text-zinc-300 animate-pulse" />
          <span>MARKETS</span>
        </div>
        
        <div className="flex overflow-hidden whitespace-nowrap">
          <div className="flex animate-ticker gap-8 px-4">
            {displayList.map((item, idx) => (
              <div key={idx} className="inline-flex items-center gap-2 text-xs font-mono">
                <span className="font-bold text-zinc-100 dark:text-zinc-200">{item.symbol}</span>
                {item.price ? (
                  <>
                    <span className="text-zinc-300 dark:text-zinc-400">${Number(item.price).toFixed(2)}</span>
                    <span className={`inline-flex items-center text-[11px] font-medium ${
                      Number(item.change) >= 0 ? 'text-zinc-300' : 'text-zinc-500'
                    }`}>
                      {Number(item.change) >= 0 ? <TrendingUp size={11} className="mr-0.5" /> : <TrendingDown size={11} className="mr-0.5" />}
                      {Number(item.change) >= 0 ? '+' : ''}{Number(item.change_percent).toFixed(2)}%
                    </span>
                  </>
                ) : (
                  <span className="text-zinc-600">LIVE...</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
