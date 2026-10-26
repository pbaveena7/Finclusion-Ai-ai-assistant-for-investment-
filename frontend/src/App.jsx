import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import ChatBot from './components/ChatBot.jsx'
import FinGPTForecaster from './components/FinGPTForecaster.jsx'
import Calculators from './components/Calculators.jsx'
import GoalPlanner from './components/GoalPlanner.jsx'
import NewsPanel from './components/NewsPanel.jsx'
import FraudChecker from './components/FraudChecker.jsx'
import ProfileSettings from './components/ProfileSettings.jsx'
import StockRecommender from './components/StockRecommender.jsx'
import StockTickerBar from './components/StockTickerBar.jsx'
import AuthModal from './components/AuthModal.jsx'
import GoogleTranslateWidget from './components/GoogleTranslateWidget.jsx'
import { LogOut, User } from 'lucide-react'

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [lang, setLang] = useState('en')
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('finclusion_user'))
    } catch {
      return null
    }
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'terminal', 'midnight')
    root.classList.add('dark')
    localStorage.setItem('finclusion_theme', 'dark')
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('finclusion_user')
    setUser(null)
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':   return <Dashboard lang={lang} setActivePage={setActivePage} />
      case 'chat':        return <ChatBot lang={lang} />
      case 'forecaster':  return <FinGPTForecaster lang={lang} />
      case 'recommender': return <StockRecommender lang={lang} />
      case 'calculators': return <Calculators lang={lang} />
      case 'goals':       return <GoalPlanner lang={lang} />
      case 'news':        return <NewsPanel lang={lang} />
      case 'fraud':       return <FraudChecker lang={lang} />
      case 'profile':     return <ProfileSettings lang={lang} setLang={setLang} />
      default:            return <Dashboard lang={lang} setActivePage={setActivePage} />
    }
  }

  return (
    <div className="flex flex-col h-screen bg-black text-zinc-100 overflow-hidden font-sans">
      {/* Live Stock Ticker Bar Animation */}
      <StockTickerBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar activePage={activePage} setActivePage={setActivePage} lang={lang} theme="dark" />

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Top Control Bar with User Info & Language Selector */}
          <header className="h-14 px-8 border-b bg-[#09090b] border-zinc-800 flex items-center justify-between shrink-0 relative z-30">
            <div className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              Finclusion AI • Workspace
            </div>

            <div className="flex items-center gap-3">
              {/* Google Translate Multilingual Widget */}
              <GoogleTranslateWidget />

              {/* User Account / Logout */}
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-lg border font-mono flex items-center gap-1.5 bg-zinc-900 border-zinc-800 text-zinc-300">
                    <User size={12} />
                    {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg border text-zinc-400 hover:text-zinc-100 transition-colors bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
                    title="Logout"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setUser({ name: 'Guest' })}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  Sign In
                </button>
              )}
            </div>
          </header>

          {/* Dynamic Page Component */}
          <div className="flex-1 overflow-auto">
            {renderPage()}
          </div>
        </main>
      </div>

      {/* Auth Modal if unauthenticated */}
      {!user && <AuthModal onLogin={loggedUser => setUser(loggedUser)} />}
    </div>
  )
}
