import { useEffect, useState } from 'react'
import { doc, getDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ViewDocument() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rejectionNote, setRejectionNote] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [acting, setActing] = useState(false)
  const { isAdmin, isAttachee, user } = useAuth()

  useEffect(() => {
    const fetchDoc = async () => {
      const snap = await getDoc(doc(db, 'documents', id))
      if (snap.exists()) setDocument({ id: snap.id, ...snap.data() })
      setLoading(false)
    }
    fetchDoc()
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this document?')) return
    await deleteDoc(doc(db, 'documents', id))
    navigate(-1)
  }

  const handleApprove = async () => {
    setActing(true)
    await updateDoc(doc(db, 'documents', id), {
      status: 'approved',
      rejectionNote: '',
      reviewedAt: serverTimestamp(),
    })
    setDocument(prev => ({ ...prev, status: 'approved' }))
    setActing(false)
  }

  const handleReject = async () => {
    if (!rejectionNote.trim()) return alert('Please provide a rejection reason')
    setActing(true)
    await updateDoc(doc(db, 'documents', id), {
      status: 'rejected',
      rejectionNote: rejectionNote.trim(),
      reviewedAt: serverTimestamp(),
    })
    setDocument(prev => ({ ...prev, status: 'rejected', rejectionNote: rejectionNote.trim() }))
    setShowRejectForm(false)
    setActing(false)
  }

  const handleResubmit = async () => {
    setActing(true)
    await updateDoc(doc(db, 'documents', id), {
      status: 'review',
      rejectionNote: '',
      updatedAt: serverTimestamp(),
    })
    setDocument(prev => ({ ...prev, status: 'review', rejectionNote: '' }))
    setActing(false)
  }

  const statusBadge = (status) => {
    const map = {
      draft: 'bg-neutral-800 text-neutral-400 border-neutral-700',
      review: 'bg-blue-950 text-blue-400 border-blue-900',
      approved: 'bg-green-950 text-green-400 border-green-900',
      rejected: 'bg-red-950 text-red-400 border-red-900',
      published: 'bg-green-950 text-green-400 border-green-900',
    }
    return map[status] || 'bg-neutral-800 text-neutral-400'
  }

  const isOwner = user && document && document.createdBy === user.uid

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!document) return (
    <div className="text-center py-20">
      <p className="text-neutral-500">Document not found.</p>
      <Link to="/documents" className="text-white text-sm mt-2 inline-block hover:underline">← Back</Link>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
        <Link to="/documents" className="hover:text-white transition-colors">Documents</Link>
        <span>/</span>
        <span className="text-neutral-300 truncate">{document.title}</span>
      </div>

      {/* Rejection note for attachee */}
      {isAttachee && document.status === 'rejected' && document.rejectionNote && (
        <div className="bg-red-950 border border-red-900 rounded p-4 mb-6">
          <p className="text-red-400 text-xs font-semibold uppercase tracking-widest mb-1">Rejected</p>
          <p className="text-red-300 text-sm">{document.rejectionNote}</p>
          {isOwner && (
            <button onClick={handleResubmit} disabled={acting}
              className="mt-3 text-xs bg-white text-black font-semibold px-3 py-1.5 rounded hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              {acting ? 'Submitting...' : 'Fix & Resubmit'}
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-white text-2xl font-bold leading-tight">{document.title}</h1>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs px-2.5 py-1 rounded border ${statusBadge(document.status)}`}>
              {document.status}
            </span>
            {(isAdmin || isOwner) && (
              <div className="flex gap-2">
                {(isAdmin || (isOwner && ['draft', 'rejected'].includes(document.status))) && (
                  <Link to={`/edit/${id}`} className="text-sm bg-neutral-800 text-white px-3 py-1.5 rounded hover:bg-neutral-700 transition-colors">Edit</Link>
                )}
                {isAdmin && (
                  <button onClick={handleDelete} className="text-sm text-neutral-500 hover:text-red-400 transition-colors px-2 py-1.5">Delete</button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-3">
          {document.category && (
            <span className="text-xs bg-neutral-800 border border-neutral-700 text-neutral-300 px-2.5 py-1 rounded">{document.category}</span>
          )}
          {document.tags?.map(tag => (
            <Link key={tag} to={`/search?tag=${encodeURIComponent(tag)}`} className="text-xs text-neutral-500 hover:text-white transition-colors">#{tag}</Link>
          ))}
          <span className="text-neutral-600 text-xs ml-auto">
            {document.createdAt?.toDate ? document.createdAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
          </span>
        </div>
      </div>

      {/* Admin approve/reject actions */}
      {isAdmin && document.type === 'submission' && document.status === 'review' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded p-4 mb-6">
          <p className="text-white text-sm font-semibold mb-3">Review this submission</p>
          {!showRejectForm ? (
            <div className="flex gap-3">
              <button onClick={handleApprove} disabled={acting}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded transition-colors disabled:opacity-50"
              >
                {acting ? 'Processing...' : '✓ Approve'}
              </button>
              <button onClick={() => setShowRejectForm(true)}
                className="bg-red-900 hover:bg-red-800 text-red-300 text-sm font-semibold px-4 py-2 rounded transition-colors"
              >
                ✕ Reject
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={rejectionNote}
                onChange={e => setRejectionNote(e.target.value)}
                placeholder="Explain why this is being rejected..."
                rows={3}
                className="w-full bg-neutral-800 border border-neutral-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors"
              />
              <div className="flex gap-2">
                <button onClick={handleReject} disabled={acting}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded transition-colors disabled:opacity-50"
                >
                  {acting ? 'Rejecting...' : 'Confirm Reject'}
                </button>
                <button onClick={() => setShowRejectForm(false)} className="text-sm text-neutral-400 hover:text-white transition-colors px-3 py-2">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="border-t border-neutral-800 pt-6 mb-6">
        <div
          className="text-neutral-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: document.content || '' }}
        />
      </div>

      {/* Attachments */}
      {document.attachments?.length > 0 && (
        <div className="border-t border-neutral-800 pt-6">
          <h3 className="text-white text-sm font-semibold uppercase tracking-widest mb-3">Attachments ({document.attachments.length})</h3>
          <div className="space-y-2">
            {document.attachments.map((a, i) => (
              <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded px-4 py-3 hover:border-neutral-600 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neutral-800 rounded flex items-center justify-center text-xs text-neutral-400 font-mono">
                    {a.name.split('.').pop().toUpperCase().slice(0,3)}
                  </div>
                  <div>
                    <p className="text-white text-sm group-hover:underline">{a.name}</p>
                    <p className="text-neutral-500 text-xs">{a.size ? `${(a.size/1024).toFixed(0)} KB` : ''}</p>
                  </div>
                </div>
                <span className="text-neutral-500 text-xs group-hover:text-white transition-colors">Download ↓</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}