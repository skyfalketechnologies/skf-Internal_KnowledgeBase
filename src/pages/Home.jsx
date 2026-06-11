import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore'
import { db } from '../firebase'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function StatCard({ label, value, color }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded p-5">
      <p className="text-neutral-500 text-xs uppercase tracking-widest font-medium mb-2">{label}</p>
      <p className={`text-3xl font-bold ${color || 'text-white'}`}>{value}</p>
    </div>
  )
}

export default function Home() {
  const { user, isAdmin, isAttachee, userName } = useAuth()
  const [allDocs, setAllDocs] = useState([])
  const [myDocs, setMyDocs] = useState([])
  const [categories, setCategories] = useState([])
  const [recentSOPs, setRecentSOPs] = useState([])

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, 'documents'), snap => {
      setAllDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    const unsub2 = onSnapshot(collection(db, 'categories'), snap => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    const sopQ = query(collection(db, 'documents'), where('type', '==', 'sop'), orderBy('createdAt', 'desc'), limit(5))
    const unsub3 = onSnapshot(sopQ, snap => {
      setRecentSOPs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    if (user) {
      const myQ = query(collection(db, 'documents'), where('createdBy', '==', user.uid), orderBy('createdAt', 'desc'), limit(5))
      const unsub4 = onSnapshot(myQ, snap => {
        setMyDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      })
      return () => { unsub1(); unsub2(); unsub3(); unsub4() }
    }
    return () => { unsub1(); unsub2(); unsub3() }
  }, [user])

  const sops = allDocs.filter(d => d.type === 'sop')
  const submissions = allDocs.filter(d => d.type === 'submission')
  const pending = submissions.filter(d => d.status === 'review')
  const approved = submissions.filter(d => d.status === 'approved')
  const allTags = [...new Set(allDocs.flatMap(d => d.tags || []))]

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const statusBadge = (status) => {
    const map = {
      draft: 'bg-neutral-800 text-neutral-400',
      review: 'bg-blue-950 text-blue-400',
      approved: 'bg-green-950 text-green-400',
      rejected: 'bg-red-950 text-red-400',
      published: 'bg-green-950 text-green-400',
    }
    return map[status] || 'bg-neutral-800 text-neutral-400'
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">{greeting()}, {userName}</h1>
        <p className="text-neutral-500 text-sm mt-1">Skyfalke Internal Knowledge Base</p>
      </div>

      {/* ADMIN VIEW */}
      {isAdmin && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="SOPs Published" value={sops.length} />
            <StatCard label="Pending Review" value={pending.length} color="text-yellow-400" />
            <StatCard label="Approved" value={approved.length} color="text-green-400" />
            <StatCard label="Categories" value={categories.length} />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-sm uppercase tracking-widest">Pending Review</h2>
                <Link to="/review-queue" className="text-neutral-500 text-xs hover:text-white transition-colors">View all →</Link>
              </div>
              <div className="space-y-2">
                {pending.length === 0 && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded p-6 text-center">
                    <p className="text-neutral-500 text-sm">No submissions pending review.</p>
                  </div>
                )}
                {pending.slice(0, 4).map(doc => (
                  <Link key={doc.id} to={`/documents/${doc.id}`}
                    className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded px-4 py-3 hover:border-neutral-600 transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{doc.title}</p>
                      <p className="text-neutral-500 text-xs mt-0.5">{doc.category}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ml-3 shrink-0 ${statusBadge(doc.status)}`}>{doc.status}</span>
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
                {categories.map(cat => {
                  const count = allDocs.filter(d => d.category === cat.name).length
                  return (
                    <Link key={cat.id} to={`/documents?category=${encodeURIComponent(cat.name)}`}
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
            </div>
          </div>
        </>
      )}

      {/* ATTACHEE VIEW */}
      {isAttachee && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="My Submissions" value={myDocs.filter(d => d.type === 'submission').length} />
            <StatCard label="Pending Review" value={myDocs.filter(d => d.status === 'review').length} color="text-yellow-400" />
            <StatCard label="Approved" value={myDocs.filter(d => d.status === 'approved').length} color="text-green-400" />
            <StatCard label="SOPs Available" value={sops.length} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-sm uppercase tracking-widest">My Recent Submissions</h2>
                <Link to="/my-submissions" className="text-neutral-500 text-xs hover:text-white transition-colors">View all →</Link>
              </div>
              <div className="space-y-2">
                {myDocs.filter(d => d.type === 'submission').length === 0 && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded p-6 text-center">
                    <p className="text-neutral-500 text-sm">No submissions yet.</p>
                    <Link to="/new" className="text-white text-sm font-medium mt-2 inline-block hover:underline">Create your first →</Link>
                  </div>
                )}
                {myDocs.filter(d => d.type === 'submission').slice(0, 4).map(doc => (
                  <Link key={doc.id} to={`/documents/${doc.id}`}
                    className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded px-4 py-3 hover:border-neutral-600 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{doc.title}</p>
                      <p className="text-neutral-500 text-xs mt-0.5">{doc.category}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ml-3 shrink-0 ${statusBadge(doc.status)}`}>{doc.status}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-sm uppercase tracking-widest">Latest SOPs</h2>
                <Link to="/documents" className="text-neutral-500 text-xs hover:text-white transition-colors">View all →</Link>
              </div>
              <div className="space-y-2">
                {recentSOPs.length === 0 && <p className="text-neutral-600 text-sm">No SOPs published yet.</p>}
                {recentSOPs.map(doc => (
                  <Link key={doc.id} to={`/documents/${doc.id}`}
                    className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded px-4 py-3 hover:border-neutral-600 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{doc.title}</p>
                      <p className="text-neutral-500 text-xs mt-0.5">{doc.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* VIEWER VIEW */}
      {!isAdmin && !isAttachee && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard label="SOPs" value={sops.length} />
            <StatCard label="Approved Docs" value={approved.length} />
            <StatCard label="Categories" value={categories.length} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm uppercase tracking-widest">Recent SOPs</h2>
              <Link to="/documents" className="text-neutral-500 text-xs hover:text-white transition-colors">View all →</Link>
            </div>
            <div className="space-y-2">
              {recentSOPs.map(doc => (
                <Link key={doc.id} to={`/documents/${doc.id}`}
                  className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded px-4 py-3 hover:border-neutral-600 transition-colors"
                >
                  <p className="text-white text-sm font-medium truncate">{doc.title}</p>
                  <span className="text-neutral-600 text-xs ml-4 shrink-0">
                    {doc.createdAt?.toDate ? doc.createdAt.toDate().toLocaleDateString() : ''}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-white font-semibold text-sm uppercase tracking-widest mb-3">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Link key={tag} to={`/search?tag=${encodeURIComponent(tag)}`}
                  className="text-xs bg-neutral-800 border border-neutral-700 text-neutral-300 px-2.5 py-1 rounded hover:border-white hover:text-white transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}