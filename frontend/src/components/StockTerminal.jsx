import { useState, useEffect } from 'react'
import {
  TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight,
  Search, Sliders, ChevronDown, Check, RefreshCw, BarChart2,
  Calendar, Download, PieChart, ShieldCheck
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { getStockQuote } from '../api/client.js'

// High-liquidity monitored assets
const STOCKS_DATA = [
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    exchange: 'NASDAQ',
    shares: 142,
    basePrice: 608.42,
    dayChangePct: 2.46,
    dayChangeVal: 14.62,
    color: '#22c55e',
    logo: '🟢',
    data7D: [
      { time: 'Aug 3', price: 575 },
      { time: 'Aug 4', price: 588 },
      { time: 'Aug 5', price: 591.80 },
      { time: 'Aug 6', price: 582 },
      { time: 'Aug 7', price: 594 },
      { time: 'Aug 8', price: 616 },
      { time: 'Aug 9', price: 608.42 },
    ]
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    exchange: 'NASDAQ',
    shares: 228,
    basePrice: 229.39,
    dayChangePct: 0.84,
    dayChangeVal: 1.91,
    color: '#3b82f6',
    logo: '🍎',
    data7D: [
      { time: 'Aug 3', price: 224 },
      { time: 'Aug 4', price: 226 },
      { time: 'Aug 5', price: 225 },
      { time: 'Aug 6', price: 227 },
      { time: 'Aug 7', price: 228 },
      { time: 'Aug 8', price: 231 },
      { time: 'Aug 9', price: 229.39 },
    ]
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    exchange: 'NASDAQ',
    shares: 95,
    basePrice: 428.15,
    dayChangePct: 1.15,
    dayChangeVal: 4.88,
    color: '#06b6d4',
    logo: '💻',
    data7D: [
      { time: 'Aug 3', price: 418 },
      { time: 'Aug 4', price: 421 },
      { time: 'Aug 5', price: 424 },
      { time: 'Aug 6', price: 420 },
      { time: 'Aug 7', price: 426 },
      { time: 'Aug 8', price: 430 },
      { time: 'Aug 9', price: 428.15 },
    ]
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    exchange: 'NASDAQ',
    shares: 60,
    basePrice: 248.50,
    dayChangePct: -1.72,
    dayChangeVal: -4.35,
    color: '#ef4444',
    logo: '⚡',
    data7D: [
      { time: 'Aug 3', price: 258 },
      { time: 'Aug 4', price: 254 },
      { time: 'Aug 5', price: 250 },
      { time: 'Aug 6', price: 246 },
      { time: 'Aug 7', price: 252 },
      { time: 'Aug 8', price: 245 },
      { time: 'Aug 9', price: 248.50 },
    ]
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    exchange: 'NASDAQ',
    shares: 80,
    basePrice: 186.20,
    dayChangePct: 1.45,
    dayChangeVal: 2.65,
    color: '#f59e0b',
    logo: '📦',
    data7D: [
      { time: 'Aug 3', price: 180 },
      { time: 'Aug 4', price: 182 },
      { time: 'Aug 5', price: 184 },
      { time: 'Aug 6', price: 183 },
      { time: 'Aug 7', price: 187 },
      { time: 'Aug 8', price: 189 },
      { time: 'Aug 9', price: 186.20 },
    ]
  }
]

export default function StockTerminal() {
  const [selectedStock, setSelectedStock] = useState(STOCKS_DATA[0])
  const [livePrices, setLivePrices] = useState({})
  const [timeframe, setTimeframe] = useState('7D')
  const [orderType, setOrderType] = useState('buy')
  const [orderShares, setOrderShares] = useState(10)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [buyingPower, setBuyingPower] = useState(18400)

  // Fetch real-time live quotes from Finnhub via backend API
  useEffect(() => {
    async function loadLiveQuotes() {
      for (const s of STOCKS_DATA) {
        try {
          const res = await getStockQuote(s.symbol)
          if (res.data?.price) {
            setLivePrices(prev => ({
              ...prev,
              [s.symbol]: {
                price: res.data.price,
                change: res.data.change,
                change_percent: res.data.change_percent
              }
            }))
          }
        } catch {
          // fallback to base price
        }
      }
    }
    loadLiveQuotes()
  }, [])

  const currentQuote = livePrices[selectedStock.symbol] || {
    price: selectedStock.basePrice,
    change: selectedStock.dayChangeVal,
    change_percent: selectedStock.dayChangePct
  }

  // Calculate dynamic portfolio values
  const totalHoldingsValue = STOCKS_DATA.reduce((acc, stock) => {
    const p = livePrices[stock.symbol]?.price || stock.basePrice
    return acc + (stock.shares * p)
  }, 0)

  const dayPnL = STOCKS_DATA.reduce((acc, stock) => {
    const ch = livePrices[stock.symbol]?.change || stock.dayChangeVal
    return acc + (stock.shares * ch)
  }, 0)

  const handleExecuteOrder = (e) => {
    e.preventDefault()
    const cost = orderShares * currentQuote.price
    if (orderType === 'buy') {
      if (cost > buyingPower) return alert('Insufficient buying power!')
      setBuyingPower(prev => prev - cost)
    } else {
      setBuyingPower(prev => prev + cost)
    }
    setOrderPlaced(true)
    setTimeout(() => setOrderPlaced(false), 3000)
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6 select-none bg-black text-white font-sans">
      {/* Top Bar / Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Overview
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Multi-Asset Terminal • Real-Time Order Routing & Portfolio Screener
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-800 bg-[#09090b] text-xs font-mono text-zinc-300">
            <Calendar size={13} className="text-zinc-400" />
            <span>Aug 3 – Aug 9, 2026</span>
          </div>

          <button 
            type="button"
            onClick={() => alert('Portfolio statement exported.')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-zinc-800 bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors"
          >
            <Download size={13} color="#000000" />
            <span style={{ color: '#000000' }}>Export</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-zinc-800/80 bg-[#09090b] space-y-2">
          <div className="text-xs text-zinc-400 font-medium">Portfolio value</div>
          <div className="text-3xl font-extrabold tracking-tight text-white font-mono">
            ${Math.round(totalHoldingsValue).toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <ArrowUpRight size={14} />
            <span>+3.2% today</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-800/80 bg-[#09090b] space-y-2">
          <div className="text-xs text-zinc-400 font-medium">Day P&L</div>
          <div className="text-3xl font-extrabold tracking-tight text-white font-mono">
            {dayPnL >= 0 ? `+$${Math.round(dayPnL).toLocaleString()}` : `-$${Math.round(Math.abs(dayPnL)).toLocaleString()}`}
          </div>
          <div className="text-xs text-zinc-500 font-mono">vs yesterday's close</div>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-800/80 bg-[#09090b] space-y-2">
          <div className="text-xs text-zinc-400 font-medium">Buying power</div>
          <div className="text-3xl font-extrabold tracking-tight text-white font-mono">
            ${Math.round(buyingPower).toLocaleString()}
          </div>
          <div className="text-xs text-zinc-500 font-mono">available to trade</div>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-800/80 bg-[#09090b] space-y-2">
          <div className="text-xs text-zinc-400 font-medium">Total return</div>
          <div className="text-3xl font-extrabold tracking-tight text-white font-mono">
            +$46,300
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <ArrowUpRight size={14} />
            <span>+22.9% all time</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart Section (Left) + Order Ticket & Top Movers (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Interactive Stock Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-zinc-800/80 bg-[#09090b] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sm">
                  {selectedStock.logo}
                </div>
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    {selectedStock.symbol}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {selectedStock.name} • {selectedStock.exchange}
                  </div>
                </div>
              </div>

              {/* Timeframe Selectors */}
              <div className="flex items-center gap-1 border border-zinc-800 rounded-xl p-1 bg-black text-[11px] font-mono">
                {['1D', '7D', '1M', '3M', '1Y', 'All'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeframe(t)}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      timeframe === t ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                ${Number(currentQuote.price).toFixed(2)}
              </span>
              <span className={`text-xs font-mono font-medium flex items-center gap-1 ${
                currentQuote.change >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {currentQuote.change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {currentQuote.change >= 0 ? '+' : ''}${Math.abs(currentQuote.change).toFixed(2)} ({Number(currentQuote.change_percent).toFixed(2)}%) past 7 days
              </span>
            </div>
          </div>

          {/* Area Chart with Emerald Gradient */}
          <div className="h-[280px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={selectedStock.data7D}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  stroke="#52525b" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#27272a' }} 
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={11} 
                  domain={['dataMin - 10', 'dataMax + 10']}
                  tickLine={false} 
                  axisLine={{ stroke: '#27272a' }}
                  tickFormatter={val => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '0.75rem', fontSize: '12px' }}
                  itemStyle={{ color: '#22c55e', fontFamily: 'monospace' }}
                  formatter={value => [`$${value}`, 'Price']}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#22c55e" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#chartGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Order Ticket & Top Movers */}
        <div className="space-y-4">
          {/* Order Ticket Card */}
          <div className="p-6 rounded-2xl border border-zinc-800/80 bg-[#09090b] space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Order ticket
            </div>

            {/* Buy / Sell Tab Switch */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-black border border-zinc-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setOrderType('buy')}
                className={`py-2 rounded-lg transition-colors ${
                  orderType === 'buy' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => setOrderType('sell')}
                className={`py-2 rounded-lg transition-colors ${
                  orderType === 'sell' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Sell
              </button>
            </div>

            {/* Cost Preview */}
            <div className="text-center py-2">
              <div className="text-2xl font-black font-mono text-white">
                ${(orderShares * currentQuote.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-zinc-400 font-mono mt-0.5">
                {orderShares} shares of {selectedStock.symbol}
              </div>
            </div>

            {/* Quick Share Percentage Chips */}
            <div className="grid grid-cols-4 gap-2 text-xs font-mono">
              {[5, 10, 25, 50].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setOrderShares(s)}
                  className={`py-1.5 rounded-lg border border-zinc-800 text-center transition-colors ${
                    orderShares === s ? 'bg-zinc-800 text-white border-zinc-600' : 'bg-black text-zinc-400 hover:text-white'
                  }`}
                >
                  {s} sh
                </button>
              ))}
            </div>

            {/* Stock Dropdown Selector */}
            <div className="relative">
              <select
                value={selectedStock.symbol}
                onChange={e => {
                  const s = STOCKS_DATA.find(x => x.symbol === e.target.value)
                  if (s) setSelectedStock(s)
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-zinc-800 bg-black text-xs font-semibold text-white outline-none cursor-pointer"
              >
                {STOCKS_DATA.map(st => (
                  <option key={st.symbol} value={st.symbol}>
                    {st.symbol} • {st.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={handleExecuteOrder}
              className="w-full py-3 rounded-xl font-bold text-xs bg-white text-black hover:bg-zinc-200 transition-colors uppercase tracking-wider"
              style={{ color: '#000000', backgroundColor: '#ffffff' }}
            >
              <span style={{ color: '#000000', fontWeight: 800 }}>
                {orderType === 'buy' ? `Buy ${selectedStock.symbol}` : `Sell ${selectedStock.symbol}`}
              </span>
            </button>

            {orderPlaced && (
              <div className="p-2.5 rounded-xl border border-emerald-900 bg-emerald-950/80 text-emerald-300 text-xs text-center font-mono">
                ✓ Order executed successfully
              </div>
            )}

            <div className="text-[11px] font-mono text-zinc-500 text-center">
              Buying power ${Math.round(buyingPower).toLocaleString()} • Fee $0
            </div>
          </div>

          {/* Top Movers Mini-List */}
          <div className="p-5 rounded-2xl border border-zinc-800/80 bg-[#09090b] space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Top movers
            </div>
            <div className="space-y-2">
              {STOCKS_DATA.slice(0, 3).map(stock => {
                const quote = livePrices[stock.symbol] || {
                  price: stock.basePrice,
                  change_percent: stock.dayChangePct
                }
                return (
                  <div 
                    key={stock.symbol}
                    onClick={() => setSelectedStock(stock)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{stock.logo}</span>
                      <span className="text-xs font-semibold text-white">{stock.name.split(' ')[0]}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-white">${Number(quote.price).toFixed(2)}</span>
                      <span className={quote.change_percent >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {quote.change_percent >= 0 ? '+' : ''}{Number(quote.change_percent).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table: Holdings */}
      <div className="p-6 rounded-2xl border border-zinc-800/80 bg-[#09090b] space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="text-sm font-bold text-white">Holdings</div>
          <div className="text-xs font-mono text-zinc-400">
            {STOCKS_DATA.length} positions • ${Math.round(totalHoldingsValue).toLocaleString()}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-800/50 pb-2">
                <th className="py-2.5 font-normal">Asset</th>
                <th className="py-2.5 font-normal">Shares</th>
                <th className="py-2.5 font-normal">Price</th>
                <th className="py-2.5 font-normal">Day change</th>
                <th className="py-2.5 font-normal">Trend</th>
                <th className="py-2.5 font-normal">Value</th>
                <th className="py-2.5 font-normal">Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {STOCKS_DATA.map(stock => {
                const quote = livePrices[stock.symbol] || {
                  price: stock.basePrice,
                  change_percent: stock.dayChangePct
                }
                const positionValue = stock.shares * quote.price
                const weight = totalHoldingsValue > 0 ? ((positionValue / totalHoldingsValue) * 100).toFixed(1) : 0
                const isSelected = selectedStock.symbol === stock.symbol

                return (
                  <tr 
                    key={stock.symbol}
                    onClick={() => setSelectedStock(stock)}
                    className={`hover:bg-zinc-900/60 cursor-pointer transition-colors ${
                      isSelected ? 'bg-zinc-900/40' : ''
                    }`}
                  >
                    <td className="py-3 flex items-center gap-2.5">
                      <span className="text-base">{stock.logo}</span>
                      <div>
                        <div className="font-bold text-white text-xs">{stock.symbol}</div>
                        <div className="text-[10px] text-zinc-400 font-sans">{stock.name}</div>
                      </div>
                    </td>
                    <td className="py-3 text-zinc-200">{stock.shares}</td>
                    <td className="py-3 text-white font-bold">${Number(quote.price).toFixed(2)}</td>
                    <td className={`py-3 ${quote.change_percent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {quote.change_percent >= 0 ? '↗ +' : '↘ '}{Number(quote.change_percent).toFixed(2)}%
                    </td>
                    <td className="py-3">
                      <div className="w-16 h-3 rounded bg-zinc-800/50 overflow-hidden">
                        <div 
                          className={`h-full ${quote.change_percent >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                          style={{ width: `${Math.min(Math.abs(quote.change_percent) * 30, 100)}%` }} 
                        />
                      </div>
                    </td>
                    <td className="py-3 text-white font-bold">${Math.round(positionValue).toLocaleString()}</td>
                    <td className="py-3 text-zinc-400">{weight}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
