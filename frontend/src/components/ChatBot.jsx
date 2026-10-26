import { useState, useEffect, useRef } from 'react'
import { sendChatMessage } from '../api/client.js'
import { Send, Bot, User, RefreshCw, Zap } from 'lucide-react'

function uuid() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export default function ChatBot({ lang }) {
  const [sessionId] = useState(() => uuid())
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (customText) => {
    const text = (customText || input).trim()
    if (!text || loading) return
    setInput('')
    setError(null)

    const userMsg = { role: 'user', content: text, id: uuid() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await sendChatMessage(text, sessionId, lang)
      const { reply, provider, model, disclaimer } = res.data
      setMessages(prev => [...prev, {
        role: 'assistant', content: reply,
        provider, model, disclaimer, id: uuid()
      }])
    } catch (e) {
      const detail = e?.response?.data?.detail || 'Failed to connect to AI service.'
      setError(detail)
    } finally {
      setLoading(false)
    }
  }

  const starterQuestions = [
    'How does Rupee Cost Averaging in SIP protect investors?',
    'What is the 50/30/20 budget framework?',
    'Explain the tax implications of PPF vs NPS.',
    'How do I spot an unregistered SEBI advisory scam?',
  ]

  return (
    <div className="flex flex-col h-full bg-black text-white select-none">
      {/* Header Bar */}
      <div className="px-8 py-4 border-b border-zinc-800 bg-[#09090b] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-zinc-900 border-zinc-700 text-white">
            <Bot size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold flex items-center gap-2 text-white">
              Financial Literacy Assistant
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-zinc-900 text-white border-zinc-700 flex items-center gap-1">
                <Zap size={10} /> Groq LPU
              </span>
            </h1>
            <p className="text-xs text-zinc-300">Adaptive guidance for beginner & intermediate investors</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([])}
          className="btn-secondary text-xs px-3 py-1.5 font-mono"
        >
          <RefreshCw size={12} /> Reset
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="max-w-xl mx-auto text-center py-16">
            <h3 className="text-xl font-bold mb-2 text-white">How can I assist your wealth journey?</h3>
            <p className="text-xs mb-8 leading-relaxed text-zinc-300">
              Ask about mutual funds, SIP simulations, debt payoff strategies, or government savings schemes.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
              {starterQuestions.map(q => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="p-3.5 rounded-xl border border-zinc-800 bg-[#09090b] hover:bg-zinc-900 text-xs transition-all text-left text-zinc-200 hover:text-white"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3.5 max-w-3xl mx-auto ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 border border-zinc-800 bg-zinc-900 text-white">
                <Bot size={15} />
              </div>
            )}
            <div className={`space-y-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed whitespace-pre-wrap border ${
                msg.role === 'user'
                  ? 'bg-zinc-800 text-white border-zinc-700 font-medium rounded-tr-none'
                  : 'bg-[#09090b] border-zinc-800 text-white rounded-tl-none shadow-sm'
              }`}>
                {msg.content}
              </div>

              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-mono text-zinc-400">
                    {msg.provider} • {msg.model}
                  </span>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 border border-zinc-800 bg-zinc-900 text-white">
                <User size={15} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3.5 max-w-3xl mx-auto justify-start">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-zinc-800 bg-zinc-900 text-white">
              <Bot size={15} />
            </div>
            <div className="rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 border border-zinc-800 bg-[#09090b]">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-white" />
              <div className="w-1.5 h-1.5 rounded-full animate-pulse delay-150 bg-zinc-300" />
              <div className="w-1.5 h-1.5 rounded-full animate-pulse delay-300 bg-zinc-500" />
              <span className="text-xs font-mono ml-2 text-zinc-300">Reasoning through market data...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto p-4 rounded-xl border border-red-900 bg-[#1f0909] text-xs font-mono text-red-200">
            Error: {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-zinc-800 bg-[#09090b]">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            className="input flex-1"
            placeholder="Ask a question about investments, risks, or financial rules..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="btn-primary px-5 shrink-0"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
