import { useState, useRef, useEffect } from 'react'
import { Sun, Moon, Sparkles, Terminal, Palette, ChevronDown, Check } from 'lucide-react'

export const THEMES = [
  {
    id: 'dark',
    name: 'Onyx Dark',
    desc: 'Deep black background with crisp white typography',
    icon: Moon,
    previewBg: 'bg-[#050505]',
    previewAccent: 'bg-white',
    badge: 'Standard'
  },
  {
    id: 'light',
    name: 'Paper Light',
    desc: 'Clean bright layout with deep charcoal text',
    icon: Sun,
    previewBg: 'bg-[#f4f4f5]',
    previewAccent: 'bg-[#09090b]',
    badge: 'Clean'
  },
  {
    id: 'terminal',
    name: 'Terminal Green',
    desc: 'High-contrast retro phosphor matrix aesthetic',
    icon: Terminal,
    previewBg: 'bg-[#030a05]',
    previewAccent: 'bg-[#00ff66]',
    badge: 'Matrix'
  },
  {
    id: 'midnight',
    name: 'Midnight Navy',
    desc: 'Deep oceanic blue with ice-blue accents',
    icon: Sparkles,
    previewBg: 'bg-[#070b14]',
    previewAccent: 'bg-[#38bdf8]',
    badge: 'Pro'
  }
]

export default function ThemeSwitcher({ currentTheme, setTheme }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const activeThemeObj = THEMES.find(t => t.id === currentTheme) || THEMES[0]
  const ActiveIcon = activeThemeObj.icon

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 border-zinc-700 bg-zinc-900/80 hover:border-zinc-500 shadow-sm"
        title="Switch Visual Theme"
      >
        <Palette size={14} className="text-zinc-400 shrink-0" />
        <span className="font-mono text-xs">{activeThemeObj.name}</span>
        <ChevronDown size={13} className={`transition-transform duration-150 opacity-60 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl z-50 border overflow-hidden bg-[#0c0c0e] border-zinc-800 text-zinc-100 p-1.5 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800/80 mb-1">
            Display Themes
          </div>
          {THEMES.map((theme) => {
            const isSelected = theme.id === currentTheme
            const Icon = theme.icon
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  setTheme(theme.id)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                  isSelected
                    ? 'bg-zinc-800 text-white font-bold'
                    : 'hover:bg-zinc-850 text-zinc-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-3.5 h-3.5 rounded-full border border-zinc-700 shrink-0 ${theme.previewBg}`} />
                  <div>
                    <div className="text-xs font-medium flex items-center gap-1.5">
                      {theme.name}
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-mono border border-zinc-700 bg-zinc-900 text-zinc-400">
                        {theme.badge}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400 font-normal leading-tight mt-0.5">
                      {theme.desc}
                    </div>
                  </div>
                </div>
                {isSelected && <Check size={14} className="shrink-0 text-white" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
