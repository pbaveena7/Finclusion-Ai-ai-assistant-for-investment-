import { useState, useEffect } from 'react'
import { getNews } from '../api/client.js'
import { Newspaper, RefreshCw, ExternalLink } from 'lucide-react'

export default function NewsPanel({ lang }) {
  const [news, setNews] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState(null)

  const load = async (q) => {
    setLoading(true); setError(null)
    try {
      const r = await getNews(q || undefined)
      setNews(r.data)
    } catch {
      setError('Failed to load news.')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Newspaper className="text-zinc-300" /> Market News & Sentiment
        </h1>
        <button onClick={() => load(search || undefined)} className="btn-secondary text-xs">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      <form onSubmit={e => { e.preventDefault(); load(search || undefined) }} className="flex gap-3">
        <input
          className="input flex-1 font-mono text-xs"
          placeholder="Filter keywords (e.g. mutual funds, RBI, SEBI, tech)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {error && <div className="text-xs text-zinc-400 font-mono">{error}</div>}

      {loading ? (
        <div className="text-xs text-zinc-500 font-mono py-8">Fetching feed...</div>
      ) : (
        <div className="space-y-3">
          {news?.articles?.map((article, i) => (
            <div key={i} className="card p-5 hover:bg-zinc-900/60 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-zinc-100 leading-snug">{article.title}</h3>
                  {article.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{article.description}</p>
                  )}
                  <div className="text-[10px] text-zinc-500 font-mono pt-1">
                    {article.source} • {article.published_at?.slice(0, 10)}
                  </div>
                </div>
                {article.url && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs p-2 shrink-0"
                  >
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
