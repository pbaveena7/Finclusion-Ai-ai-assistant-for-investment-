import {
  LayoutDashboard, MessageCircle, LineChart, Calculator, Target,
  Newspaper, ShieldAlert, Settings, TrendingUp, Sparkles
} from 'lucide-react'

const navItems = [
  { id: 'dashboard',   label: 'Dashboard Overview',  icon: LayoutDashboard },
  { id: 'chat',        label: 'AI Financial Assistant', icon: MessageCircle },
  { id: 'forecaster',  label: 'FinGPT Forecaster',    icon: LineChart },
  { id: 'recommender', label: 'Stock Recommender',    icon: Sparkles },
  { id: 'calculators', label: 'Financial Calculators', icon: Calculator },
  { id: 'goals',       label: 'Goal Planner',         icon: Target },
  { id: 'news',        label: 'Market News & Sentiment', icon: Newspaper },
  { id: 'fraud',       label: 'Scam & URL Sentinel',   icon: ShieldAlert },
  { id: 'profile',     label: 'Settings & Profile',    icon: Settings },
]

export default function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="w-64 shrink-0 flex flex-col h-full border-r bg-[#09090b] border-zinc-800 text-white select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-800">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black shadow-sm bg-white text-black">
          <TrendingUp size={19} className="text-black" />
        </div>
        <div>
          <div className="font-extrabold text-base tracking-tight leading-tight text-white">
            Finclusion AI
          </div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-300">
            Financial Suite
          </div>
        </div>
      </div>

      {/* Structured Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-300">
          All Workspace Modules
        </div>

        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id
          return (
            <button
              key={id}
              onClick={() => setActivePage(id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-zinc-200 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Icon size={17} className={isActive ? 'text-black shrink-0' : 'text-zinc-300 shrink-0'} />
              <span className={`truncate ${isActive ? 'text-black font-bold' : 'text-zinc-200'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Bottom Indicator */}
      <div className="p-4 border-t border-zinc-800">
        <div className="p-3 rounded-xl border bg-zinc-900 border-zinc-700">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-white">
              Live APIs Connected
            </span>
          </div>
          <p className="text-[10px] font-mono text-zinc-300">
            Groq LPU, Finnhub & NewsAPI Online
          </p>
        </div>
      </div>
    </aside>
  )
}
