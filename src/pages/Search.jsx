import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { Link, useSearchParams } from 'react-router-dom'

export default function Search() {
  const [docs, setDocs] = useState([])
  const [searchParams] = useSearchParams()
  const tagParam = searchParams.get('tag') || ''
  const [query, setQuery] = useState(tagParam)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'documents'), snap => {
      setDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  const results = query.trim()
    ? docs.filter(d => {
        const q = query.toLowerCase()
        return (
          d.title?.toLowerCase().includes(q) ||
          d.content?.toLowerCase().includes(q) ||
          d.category?.toLowerCase().includes(q) ||
          d.tags?.some(t => t.toLowerCase().includes(q))
        )
      })
    : []

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold mb-1">Search</h1>
        <p className="text-neutral-500 text-sm">Search by title, content, category or tag</p>
      </div>

      <div className="relative mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">⌕</span>
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search documents..."
          className="w-full bg-neutral-900 border border-neutral-700 text-white rounded px-4 py-3 pl-10 text-sm focus:outline-none focus:border-white transition-colors"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors">×</button>
        )}
      </div>

      {query.trim() === '' && (
        <div className="text-center py-12">
          <p className="text-neutral-600 text-sm">Start typing to search across all documents</p>
        </div>
      )}

      {query.trim() !== '' && results.length === 0 && (
        <div className="text-center py-12 border border-dashed border-neutral-800 rounded">
          <p className="text-neutral-500 text-sm">No documents found for "<span className="text-white">{query}</span>"</p>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <p className="text-neutral-500 text-xs mb-4">{results.length} result{results.length !== 1 ? 's' : ''} for "<span className="text-white">{query}</span>"</p>
          <div className="space-y-3">
            {results.map(doc => (
              <Link
                key={doc.id}
                to={`/documents/${doc.id}`}
                className="block bg-neutral-900 border border-neutral-800 rounded p-4 hover:border-neutral-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm">{doc.title}</p>
                    <p className="text-neutral-500 text-xs mt-0.5">{doc.category}</p>
                  </div>
                  <span className="text-neutral-600 text-xs shrink-0">
                    {doc.createdAt?.toDate ? doc.createdAt.toDate().toLocaleDateString() : ''}
                  </span>
                </div>
                <p className="text-neutral-500 text-xs mt-2 leading-relaxed" style={{display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                  {doc.content?.replace(/[#*`>-]/g, '').slice(0, 150)}
                </p>
                {doc.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {doc.tags.map(tag => (
                      <span key={tag} className={`text-xs px-2 py-0.5 rounded ${tag.toLowerCase().includes(query.toLowerCase()) ? 'bg-yellow-400 text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}