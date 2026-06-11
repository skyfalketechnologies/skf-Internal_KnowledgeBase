import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function MySubmissions() {
  const { user, isAttachee } = useAuth()
  const [docs, setDocs] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'documents'), where('createdBy', '==', user.uid), where('type', '==', 'submission'))
    const unsub = onSnapshot(q, snap => {
      setDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [user])

  if (!isAttachee) return <Navigate to="/" replace />

  const handleDelete = async (id) => {
    if (!confirm('Delete this submission?')) return
    await deleteDoc(doc(db, 'documents', id))
  }

  const filtered = filter === 'all' ? docs : docs.filter(d => d.status === filter)

  const statusBadge = (status) => {
    const map = {
      draft: 'bg-neutral-800 text-neutral-400',
      review: 'bg-blue-950 text-blue-400',
      approved: 'bg-green-950 text-green-400',
      rejected: 'bg-red-950 text-red-400',
    }
    return map[status] || 'bg-neutral-800 text-neutral-400'
  }

  const filters = ['all', 'draft', 'review', 'approved', 'rejected']

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">My Submissions</h1>
          <p className="text-neutral-500 text-sm mt-1">{docs.length} total submission{docs.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/new" className="bg-white text-black text-sm font-semibold px-4 py-2 rounded hover:bg-neutral-200 transition-colors">
          + New Submission
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-white text-black'
                : 'bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700'
            }`}
          >
            {f} {f === 'all' ? `(${docs.length})` : `(${docs.filter(d => d.status === f).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-neutral-700 rounded p-12 text-center">
          <p className="text-neutral-500 text-sm mb-3">No {filter === 'all' ? '' : filter} submissions yet.</p>
          <Link to="/new" className="text-white text-sm font-medium hover:underline">Create one →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(doc => (
            <div key={doc.id} className="bg-neutral-900 border border-neutral-800 rounded p-4 hover:border-neutral-600 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Link to={`/documents/${doc.id}`} className="text-white font-semibold text-sm hover:underline block truncate">
                    {doc.title}
                  </Link>
                  <p className="text-neutral-500 text-xs mt-1">{doc.category || 'Uncategorised'}</p>
                  {doc.status === 'rejected' && doc.rejectionNote && (
                    <p className="text-red-400 text-xs mt-2 bg-red-950 border border-red-900 rounded px-3 py-2">
                      <span className="font-semibold">Rejected: </span>{doc.rejectionNote}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded ${statusBadge(doc.status)}`}>{doc.status}</span>
                  {['draft', 'rejected'].includes(doc.status) && (
                    <Link to={`/edit/${doc.id}`} className="text-neutral-500 text-xs hover:text-white transition-colors">Edit</Link>
                  )}
                  {doc.status === 'draft' && (
                    <button onClick={() => handleDelete(doc.id)} className="text-neutral-500 text-xs hover:text-red-400 transition-colors">Delete</button>
                  )}
                </div>
              </div>
              {doc.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {doc.tags.map(tag => (
                    <span key={tag} className="text-xs bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded">#{tag}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-800">
                <span className="text-neutral-600 text-xs">
                  {doc.createdAt?.toDate ? doc.createdAt.toDate().toLocaleDateString() : ''}
                </span>
                {doc.status === 'rejected' && (
                  <Link to={`/documents/${doc.id}`} className="text-xs text-white font-medium hover:underline">Fix & Resubmit →</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}