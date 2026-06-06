import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function StatCard({ label, value }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded p-5">
      <p className="text-neutral-500 text-xs uppercase tracking-widest font-medium mb-2">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  )
}

export default function Home() {
  const { user } = useAuth()
  const [docs, setDocs] = useState([])
  const [categories, setCategories] = useState([])
  const [recent, setRecent] = useState([])

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, 'documents'), snap => {
      setDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    const unsub2 = onSnapshot(collection(db, 'categories'), snap => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'), limit(5))
    const unsub3 = onSnapshot(q, snap => {
      setRecent(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => { unsub1(); unsub2(); unsub3() }
  }, [])

  const allTags = [...new Set(docs.flatMap(d => d.tags || []))]

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">{greeting()}</h1>
        <p className="text-neutral-500 text-sm mt-1">{user?.email} · Skyfalke Internal Knowledge Base</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Documents" value={docs.length} />
        <StatCard label="Categories" value={categories.length} />
        <StatCard label="Tags" value={allTags.length} />
        <StatCard label="Attachments" value={docs.reduce((a, d) => a + (d.attachments?.length || 0), 0)} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm uppercase tracking-widest">Recent Documents</h2>
            <Link to="/documents" className="text-neutral-500 text-xs hover:text-white transition-colors">View all →</Link>
          </div>
          <div className="space-y-2">
            {recent.length === 0 && (
              <div className="bg-neutral-900 border border-neutral-800 rounded p-6 text-center">
                <p className="text-neutral-500 text-sm">No documents yet.</p>
                <Link to="/new" className="text-white text-sm font-medium mt-2 inline-block hover:underline">Create your first document →</Link>
              </div>
            )}
            {recent.map(doc => (
              <Link
                key={doc.id}
                to={`/documents/${doc.id}`}
                className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded px-4 py-3 hover:border-neutral-600 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate group-hover:text-neutral-200">{doc.title}</p>
                  <p className="text-neutral-500 text-xs mt-0.5">{doc.category || 'Uncategorised'} · {doc.tags?.slice(0,2).join(', ')}</p>
                </div>
                <span className="text-neutral-600 text-xs ml-4 shrink-0">
                  {doc.createdAt?.toDate ? doc.createdAt.toDate().toLocaleDateString() : ''}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm uppercase tracking-widest">Categories</h2>
            <Link to="/categories" className="text-neutral-500 text-xs hover:text-white transition-colors">Manage →</Link>
          </div>
          <div className="space-y-2">
            {categories.length === 0 && <p className="text-neutral-600 text-sm">No categories yet.</p>}
            {categories.map(cat => {
              const count = docs.filter(d => d.category === cat.name).length
              return (
                <Link
                  key={cat.id}
                  to={`/documents?category=${encodeURIComponent(cat.name)}`}
                  className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded px-4 py-3 hover:border-neutral-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: cat.color || '#fff' }} />
                    <span className="text-white text-sm">{cat.name}</span>
                  </div>
                  <span className="text-neutral-500 text-xs">{count}</span>
                </Link>
              )
            })}
          </div>

          <h2 className="text-white font-semibold text-sm uppercase tracking-widest mt-6 mb-3">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {allTags.length === 0 && <p className="text-neutral-600 text-sm">No tags yet.</p>}
            {allTags.map(tag => (
              <Link
                key={tag}
                to={`/search?tag=${encodeURIComponent(tag)}`}
                className="text-xs bg-neutral-800 border border-neutral-700 text-neutral-300 px-2.5 py-1 rounded hover:border-white hover:text-white transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}