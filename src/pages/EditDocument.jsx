import { useEffect, useState } from 'react'
import { doc, getDoc, updateDoc, serverTimestamp, collection, onSnapshot } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'
import { useNavigate, useParams, Link } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'
import { useAuth } from '../context/AuthContext'

export default function EditDocument() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])
  const [categories, setCategories] = useState([])
  const [existingAttachments, setExistingAttachments] = useState([])
  const [newFiles, setNewFiles] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDoc = async () => {
      const snap = await getDoc(doc(db, 'documents', id))
      if (snap.exists()) {
        const data = snap.data()
        setTitle(data.title || '')
        setContent(data.content || '')
        setCategory(data.category || '')
        setTags(data.tags || [])
        setExistingAttachments(data.attachments || [])
      }
      setLoading(false)
    }
    fetchDoc()
    const unsub = onSnapshot(collection(db, 'categories'), snap => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [id])

  if (!isAdmin) return (
    <div className="flex items-center justify-center h-64 flex-col gap-3">
      <p className="text-neutral-400 text-sm">You don't have permission to edit documents.</p>
      <Link to="/documents" className="text-white text-sm font-medium hover:underline">← Back to documents</Link>
    </div>
  )

  const addTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = tagInput.trim().toLowerCase().replace(/,/g, '')
      if (val && !tags.includes(val)) setTags([...tags, val])
      setTagInput('')
    }
  }

  const removeTag = (tag) => setTags(tags.filter(t => t !== tag))
  const removeAttachment = (url) => setExistingAttachments(existingAttachments.filter(a => a.url !== url))

  const handleSave = async () => {
    if (!title.trim()) return alert('Title is required')
    setSaving(true)
    try {
      const newAttachments = []
      for (const file of newFiles) {
        const fileRef = ref(storage, `attachments/${Date.now()}_${file.name}`)
        await uploadBytes(fileRef, file)
        const url = await getDownloadURL(fileRef)
        newAttachments.push({ name: file.name, url, size: file.size, type: file.type })
      }
      await updateDoc(doc(db, 'documents', id), {
        title: title.trim(),
        content,
        category: category || 'General',
        tags,
        attachments: [...existingAttachments, ...newAttachments],
        updatedAt: serverTimestamp(),
      })
      navigate(`/documents/${id}`)
    } catch (err) {
      console.error(err)
      alert('Error updating document')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full bg-neutral-900 border border-neutral-700 text-white rounded px-3 py-2.5 text-sm focus:outline-none focus:border-white transition-colors"

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Edit Document</h1>
          <p className="text-neutral-500 text-sm mt-1">Update this knowledge base entry</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate(`/documents/${id}`)} className="text-sm text-neutral-400 hover:text-white transition-colors px-4 py-2">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="bg-white text-black text-sm font-semibold px-5 py-2 rounded hover:bg-neutral-200 transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-neutral-400 text-xs uppercase tracking-widest font-medium mb-1.5">Title *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className={inputClass} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-neutral-400 text-xs uppercase tracking-widest font-medium mb-1.5">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className={inputClass}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-neutral-400 text-xs uppercase tracking-widest font-medium mb-1.5">Tags</label>
            <div className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2 flex flex-wrap gap-1.5 min-h-10.5 focus-within:border-white transition-colors">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 bg-neutral-700 text-neutral-200 text-xs px-2 py-0.5 rounded">
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="text-neutral-400 hover:text-white ml-0.5">×</button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder={tags.length === 0 ? 'Type tag and press Enter' : ''}
                className="bg-transparent text-white text-xs outline-none flex-1 min-w-20"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-neutral-400 text-xs uppercase tracking-widest font-medium mb-1.5">Content *</label>
          <div data-color-mode="dark">
            <MDEditor value={content} onChange={setContent} height={400} style={{ background: '#171717', border: '1px solid #404040' }} />
          </div>
        </div>

        {existingAttachments.length > 0 && (
          <div>
            <label className="block text-neutral-400 text-xs uppercase tracking-widest font-medium mb-1.5">Existing Attachments</label>
            <div className="space-y-2">
              {existingAttachments.map(a => (
                <div key={a.url} className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded px-3 py-2">
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs hover:underline truncate">{a.name}</a>
                  <button onClick={() => removeAttachment(a.url)} className="text-neutral-500 hover:text-red-400 text-xs ml-3 shrink-0">Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-neutral-400 text-xs uppercase tracking-widest font-medium mb-1.5">Add More Attachments</label>
          <div className="bg-neutral-900 border border-neutral-700 border-dashed rounded p-5 text-center">
            <input type="file" multiple onChange={e => setNewFiles(Array.from(e.target.files))} className="hidden" id="file-upload-edit" />
            <label htmlFor="file-upload-edit" className="cursor-pointer">
              <p className="text-neutral-400 text-sm">Click to attach files</p>
            </label>
            {newFiles.length > 0 && (
              <div className="mt-3 space-y-1 text-left">
                {newFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-neutral-800 rounded px-3 py-2">
                    <span className="text-white text-xs truncate">{f.name}</span>
                    <span className="text-neutral-500 text-xs ml-3">{(f.size/1024).toFixed(0)} KB</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}