import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function ReviewQueue() {
  const { isAdmin } = useAuth()
  const [submissions, setSubmissions] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'documents'), where('type', '==', 'submission'), where('status', '==', 'review'))
    const unsub = onSnapshot(q, snap => {
      setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  if (!isAdmin) return <Navigate to="/" replace />

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">Review Queue</h1>
        <p className="text-neutral-500 text-sm mt-1">{submissions.length} submission{submissions.length !== 1 ? 's' : ''} pending review</p>
      </div>

      {submissions.length === 0 ? (
        <div className="border border-dashed border-neutral-700 rounded p-12 text-center">
          <p className="text-neutral-500 text-sm">No submissions pending review.</p>
          <p className="text-neutral-600 text-xs mt-2">Attachees will appear here when they submit their work.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map(doc => (
            <div key={doc.id} className="bg-neutral-900 border border-neutral-800 rounded p-4 hover:border-neutral-600 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Link to={`/documents/${doc.id}`} className="text-white font-semibold text-sm hover:underline block">
                    {doc.title}
                  </Link>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-neutral-500 text-xs">{doc.category || 'Uncategorised'}</span>
                    <span className="text-neutral-600 text-xs">·</span>
                    <span className="text-neutral-500 text-xs">
                      {doc.createdAt?.toDate ? doc.createdAt.toDate().toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className="text-neutral-600 text-xs mt-2 leading-relaxed" style={{display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                    {doc.content?.replace(/<[^>]*>/g, '').slice(0, 150)}
                  </p>
                  {doc.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {doc.tags.map(tag => (
                        <span key={tag} className="text-xs bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <Link
                  to={`/documents/${doc.id}`}
                  className="shrink-0 bg-white text-black text-xs font-semibold px-3 py-1.5 rounded hover:bg-neutral-200 transition-colors"
                >
                  Review →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}