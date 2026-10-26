import { useState } from 'react'
import { Target, TrendingUp, Sparkles, BrainCircuit, ArrowUpRight, ShieldCheck, DollarSign, Calendar, Layers, BarChart3 } from 'lucide-react'
import { recommendStocks } from '../api/client.js'

export default function StockRecommender() {
  const [investment, setInvestment] = useState(50000)
  const [target, setTarget] = useState(150000)
  const [years, setYears] = useState(4)
  const [riskPreference, setRiskPreference] = useState('moderate')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleCalculate = async (e) => {
    if (e) e.preventDefault()
    if (investment <= 0 || target <= 0 || years <= 0) return

    setLoading(true)
    setError(null)
    try {
      const res = await recommendStocks({
        investment_amount: parseFloat(investment),
        target_amount: parseFloat(target),
        time_limit_years: parseFloat(years),
        risk_preference: riskPreference,
      })
      setResult(res.data)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to generate recommendation at this moment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-3 border dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 bg-white border-zinc-200 text-zinc-700">
          <BrainCircuit size={14} className="text-zinc-500" />
          <span>Hedge Fund Multilayer Perceptron (MLPnn) + Finnhub Live</span>
        </div>
        <h1 className="text-3xl font-extrabold flex items-center gap-3 text-zinc-900 dark:text-white">
          <Target className="text-zinc-800 dark:text-zinc-200" size={32} />
          Target-Based Stock Matcher & Portfolio Allocator
        </h1>
        <p className="text-sm mt-1 text-zinc-600 dark:text-zinc-400">
          Enter your current capital, final financial target, and timeframe. Our neural network engine determines the exact required CAGR and matches mathematically optimized equities.
        </p>
      </div>

      {/* Input Parameters Card */}
      <div className="card">
        <form onSubmit={handleCalculate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="label flex items-center gap-1.5">
                <DollarSign size={14} /> Initial Investment Amount (₹ / $)
              </label>
              <input
                type="number"
                min="100"
                value={investment}
                onChange={(e) => setInvestment(Number(e.target.value))}
                className="input font-mono font-semibold"
                placeholder="50000"
                required
              />
            </div>

            <div>
              <label className="label flex items-center gap-1.5">
                <Target size={14} /> Target Corpus Amount (₹ / $)
              </label>
              <input
                type="number"
                min="100"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="input font-mono font-semibold"
                placeholder="150000"
                required
              />
            </div>

            <div>
              <label className="label flex items-center gap-1.5">
                <Calendar size={14} /> Time Horizon (Years)
              </label>
              <input
                type="number"
                min="0.5"
                max="30"
                step="0.5"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="input font-mono font-semibold"
                placeholder="4"
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t dark:border-zinc-800 border-zinc-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-zinc-500">Risk Bias:</span>
              {['conservative', 'moderate', 'aggressive'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setRiskPreference(level)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-all border ${
                    riskPreference === level
                      ? 'dark:bg-white dark:text-black font-bold bg-black text-white border-transparent'
                      : 'dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 bg-zinc-100 border-zinc-300 text-zinc-700'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full sm:w-auto px-8 py-3"
            >
              {loading ? 'Synthesizing Neural Allocation...' : 'Calculate Optimal Stocks'}
              <Sparkles size={16} />
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl border text-xs font-mono dark:bg-zinc-900 dark:border-zinc-800 text-red-500 bg-red-50 border-red-200">
          {error}
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Diagnostic Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card">
              <div className="text-xs font-mono uppercase text-zinc-500 mb-1">Required Annual CAGR</div>
              <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
                {result.required_cagr}%
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">Growth rate per annum</div>
            </div>

            <div className="card">
              <div className="text-xs font-mono uppercase text-zinc-500 mb-1">Target Multiple</div>
              <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
                {(result.target_amount / result.investment_amount).toFixed(2)}x
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">in {result.time_limit_years} years</div>
            </div>

            <div className="card">
              <div className="text-xs font-mono uppercase text-zinc-500 mb-1">Feasibility Profile</div>
              <div className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">
                {result.feasibility}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">Risk index: {result.risk_score}/100</div>
            </div>

            <div className="card">
              <div className="text-xs font-mono uppercase text-zinc-500 mb-1">AI Modeling Engine</div>
              <div className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">
                Hedge Fund MLPnn
              </div>
              <div className="text-[11px] font-mono text-zinc-500 mt-1">3 Layers (64-32-16)</div>
            </div>
          </div>

          {/* Allocation Portfolio */}
          <div>
            <h2 className="text-base font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
              <Layers size={18} /> Recommended Equities & Capital Allocation
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {result.recommended_stocks.map((stock) => (
                <div key={stock.symbol} className="card space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold font-mono text-zinc-900 dark:text-white">
                          {stock.symbol}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded border dark:bg-zinc-800 dark:border-zinc-700 text-zinc-500 font-mono">
                          {stock.sector}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 mt-0.5">
                        {stock.name}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-zinc-900 dark:text-white">
                        ${stock.current_price}
                      </div>
                      <div className={`text-xs font-mono ${stock.change_pct >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {stock.change_pct >= 0 ? '+' : ''}{Number(stock.change_pct).toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {stock.desc}
                  </p>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl border dark:bg-zinc-900 dark:border-zinc-800 bg-zinc-50 border-zinc-200 text-center">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-zinc-500">Allocation</div>
                      <div className="text-sm font-bold font-mono text-zinc-900 dark:text-white">
                        {stock.allocation_pct}%
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        ${stock.allocated_capital}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono uppercase text-zinc-500">Target Price</div>
                      <div className="text-sm font-bold font-mono text-zinc-900 dark:text-white">
                        ${stock.projected_target_price}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        CAGR: {stock.mid_cagr}%
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono uppercase text-zinc-500">MLP Conf.</div>
                      <div className="text-sm font-bold font-mono text-zinc-900 dark:text-white">
                        {stock.mlp_hedge_fund_confidence}%
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        Risk: {stock.risk_tier}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}