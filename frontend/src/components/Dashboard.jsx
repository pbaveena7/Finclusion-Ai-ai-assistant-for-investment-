import { useState, useEffect } from 'react'
import { getHealth } from '../api/client.js'
import { TrendingUp, Shield, Calculator, Globe, MessageCircle, ArrowUpRight, Activity, Zap } from 'lucide-react'

export default function Dashboard({ lang, setActivePage }) {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    getHealth()
      .then(r => setHealth(r.data))
      .catch(() => {})
  }, [])

  const stats = [
    { label: 'AI Provider', value: health?.ai_ready ? 'Groq LPU' : 'Offline', sub: 'Llama 3 / Qwen OSS', icon: MessageCircle, ok: health?.ai_ready },
    { label: 'Market Engine', value: health?.finnhub_configured ? 'Finnhub Live' : 'Offline', sub: 'Real-time Quotes', icon: Activity, ok: health?.finnhub_configured },
    { label: 'News Sentiment', value: health?.news_configured ? 'NewsAPI Live' : 'Offline', sub: 'Global Feeds', icon: Globe, ok: health?.news_configured },
    { label: 'Fraud Shield', value: 'Active', sub: 'Heuristic Sentinel', icon: Shield, ok: true },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 select-none">
      {/* Hero Banner */}
      <div className="card relative overflow-hidden p-8 border border-zinc-800 bg-zinc-950">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-4 border border-zinc-700 bg-zinc-900 text-white font-semibold">
            <Zap size={14} className="text-white" />
            FinGPT-Powered Financial Literacy Platform
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-white">
            Financial Intelligence & Inclusive Planning
          </h1>
          <p className="text-sm leading-relaxed mb-6 text-zinc-200">
            Explore AI-grounded market forecasting, high-precision compounding calculators, 
            instant fraud detection, and tailored education modules designed for all wealth-building stages.
          </p>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setActivePage && setActivePage('forecaster')} 
              className="btn-primary"
            >
              Open FinGPT Forecaster
            </button>
            <button 
              onClick={() => setActivePage && setActivePage('chat')} 
              className="btn-secondary"
            >
              Ask Financial AI
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, icon: Icon, ok }) => (
          <div key={label} className="card bg-zinc-950 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-zinc-900 border-zinc-700 text-white">
                <Icon size={18} />
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border bg-zinc-900 text-white border-zinc-700 font-bold">
                {ok ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <div className="text-xl font-bold mb-0.5 text-white">{value}</div>
            <div className="text-xs font-semibold mb-1 text-zinc-200">{label}</div>
            <div className="text-[11px] font-mono text-zinc-300">{sub}</div>
          </div>
        ))}
      </div>

      {/* Modules */}
      <div>
        <h2 className="text-base font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-white">
          Core Modules
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              title: 'FinGPT Market Forecaster',
              desc: 'Live stock ticker intelligence with Positive Factors, Potential Concerns & Outlook.',
              action: () => setActivePage && setActivePage('forecaster'),
              badge: 'FinGPT Official',
            },
            {
              title: 'Investment Calculators',
              desc: 'Precision monthly compounding for SIP, SWP, PPF maturity, and NPS corpus models.',
              action: () => setActivePage && setActivePage('calculators'),
              badge: 'Mathematical Models',
            },
            {
              title: 'Scam & URL Sentinel',
              desc: 'Heuristic engine analyzing suspicious investment messages, OTP requests, and fake domains.',
              action: () => setActivePage && setActivePage('fraud'),
              badge: 'Pattern Engine',
            }
          ].map((item, idx) => (
            <div 
              key={idx} 
              onClick={item.action}
              className="card cursor-pointer group transition-all bg-zinc-950 hover:bg-zinc-900 border border-zinc-800"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-300">{item.badge}</span>
                <ArrowUpRight size={16} className="transition-colors text-zinc-300 group-hover:text-white" />
              </div>
              <h3 className="text-base font-bold mb-1.5 text-white">
                {item.title}
              </h3>
              <p className="text-xs leading-relaxed text-zinc-200">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Note */}
      <div className="p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-3 bg-zinc-950 border-zinc-800 text-zinc-200">
        <Shield size={16} className="shrink-0 mt-0.5 text-white" />
        <div>
          <strong className="text-white">Educational Notice:</strong> Finclusion AI is designed for financial literacy, simulation, and research. All calculations and forecasts are estimates and do not constitute certified financial or investment advice.
        </div>
      </div>
    </div>
  )
}
