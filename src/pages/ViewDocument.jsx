import { useEffect, useState } from 'react'
import { doc, getDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useNavigate, useParams, Link } from 'react-router-dom'
import MarkdownRenderer from '../components/MarkdownRenderer'

export default function ViewDocument() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)

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
    navigate('/documents')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!document) return (
    <div className="text-center py-20">
      <p className="text-neutral-500">Document not found.</p>
      <Link to="/documents" className="text-white text-sm mt-2 inline-block hover:underline">← Back to documents</Link>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
        <Link to="/documents" className="hover:text-white transition-colors">Documents</Link>
        <span>/</span>
        <span className="text-neutral-300 truncate">{document.title}</span>
      </div>

      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-white text-2xl font-bold leading-tight">{document.title}</h1>
          <div className="flex gap-3 shrink-0">
            <Link to={`/edit/${id}`} className="text-sm bg-neutral-800 text-white px-3 py-1.5 rounded hover:bg-neutral-700 transition-colors">Edit</Link>
            <button onClick={handleDelete} className="text-sm text-neutral-500 hover:text-red-400 transition-colors px-2 py-1.5">Delete</button>
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

      <div className="border-t border-neutral-800 pt-6 mb-6">
        <MarkdownRenderer content={document.content || ''} />
      </div>

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