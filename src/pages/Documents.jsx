import { useEffect, useState } from 'react'
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { Link, useSearchParams } from 'react-router-dom'

export default function Documents() {
  const [docs, setDocs] = useState([])
  const [categories, setCategories] = useState([])
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'All'

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, 'documents'), snap => {
      setDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    const unsub2 = onSnapshot(collection(db, 'categories'), snap => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => { unsub1(); unsub2() }
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return
    await deleteDoc(doc(db, 'documents', id))
  }

  const filtered = activeCategory === 'All' ? docs : docs.filter(d => d.category === activeCategory)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Documents</h1>
          <p className="text-neutral-500 text-sm mt-1">{filtered.length} document{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/new" className="bg-white text-black text-sm font-semibold px-4 py-2 rounded hover:bg-neutral-200 transition-colors">
          + New Document
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {['All', ...categories.map(c => c.name)].map(cat => (
          <button
            key={cat}
            onClick={() => setSearchParams(cat === 'All' ? {} : { category: cat })}
            className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-white text-black'
                : 'bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-neutral-700 rounded p-12 text-center">
          <p className="text-neutral-500 text-sm mb-3">No documents in this category.</p>
          <Link to="/new" className="text-white text-sm font-medium hover:underline">Create one →</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map(doc => (
            <div key={doc.id} className="bg-neutral-900 border border-neutral-800 rounded p-4 hover:border-neutral-600 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Link to={`/documents/${doc.id}`} className="text-white font-semibold text-sm hover:underline block truncate">
                    {doc.title}
                  </Link>
                  <p className="text-neutral-500 text-xs mt-1">{doc.category || 'Uncategorised'}</p>
                </div>
                <div className="flex gap-3 shrink-0">
                  <Link to={`/edit/${doc.id}`} className="text-neutral-500 text-xs hover:text-white transition-colors">Edit</Link>
                  <button onClick={() => handleDelete(doc.id)} className="text-neutral-500 text-xs hover:text-red-400 transition-colors">Delete</button>
                </div>
              </div>
              <p className="text-neutral-600 text-xs mt-2 leading-relaxed" style={{display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                {doc.content?.replace(/[#*`>-]/g, '').slice(0, 120)}...
              </p>
              {doc.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {doc.tags.map(tag => (
                    <span key={tag} className="text-xs bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded">#{tag}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-800">
                <span className="text-neutral-600 text-xs">
                  {doc.attachments?.length > 0 ? `${doc.attachments.length} attachment${doc.attachments.length > 1 ? 's' : ''}` : 'No attachments'}
                </span>
                <span className="text-neutral-600 text-xs">
                  {doc.createdAt?.toDate ? doc.createdAt.toDate().toLocaleDateString() : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}