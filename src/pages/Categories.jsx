import { useEffect, useState } from 'react'
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

const COLORS = ['#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#6366f1', '#a855f7', '#ec4899']

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [docs, setDocs] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#ffffff')
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, 'categories'), snap => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    const unsub2 = onSnapshot(collection(db, 'documents'), snap => {
      setDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => { unsub1(); unsub2() }
  }, [])

  const reset = () => { setName(''); setDescription(''); setColor('#ffffff'); setEditingId(null) }

  const handleSave = async () => {
    if (!name.trim()) return alert('Category name required')
    setSaving(true)
    try {
      if (editingId) {
        await updateDoc(doc(db, 'categories', editingId), { name: name.trim(), description: description.trim(), color })
      } else {
        await addDoc(collection(db, 'categories'), { name: name.trim(), description: description.trim(), color })
      }
      reset()
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const startEdit = (cat) => {
    setEditingId(cat.id); setName(cat.name)
    setDescription(cat.description || ''); setColor(cat.color || '#ffffff')
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return
    await deleteDoc(doc(db, 'categories', id))
  }

  const inputClass = "w-full bg-neutral-900 border border-neutral-700 text-white rounded px-3 py-2.5 text-sm focus:outline-none focus:border-white transition-colors"

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">Categories</h1>
        <p className="text-neutral-500 text-sm mt-1">Organise your documents into categories</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded p-5">
          <h2 className="text-white font-semibold text-sm mb-4">{editingId ? 'Edit Category' : 'New Category'}</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-neutral-400 text-xs uppercase tracking-widest font-medium mb-1.5">Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Engineering" className={inputClass} />
            </div>
            <div>
              <label className="block text-neutral-400 text-xs uppercase tracking-widest font-medium mb-1.5">Description</label>
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description" className={inputClass} />
            </div>
            <div>
              <label className="block text-neutral-400 text-xs uppercase tracking-widest font-medium mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-neutral-900' : 'hover:scale-110'}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleSave} disabled={saving} className="bg-white text-black text-sm font-semibold px-4 py-2 rounded hover:bg-neutral-200 transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              {editingId && (
                <button onClick={reset} className="text-sm text-neutral-400 hover:text-white transition-colors px-3 py-2">Cancel</button>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-white font-semibold text-sm mb-4">All Categories ({categories.length})</h2>
          {categories.length === 0 ? (
            <div className="border border-dashed border-neutral-800 rounded p-8 text-center">
              <p className="text-neutral-600 text-sm">No categories yet. Create one.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map(cat => {
                const count = docs.filter(d => d.category === cat.name).length
                return (
                  <div key={cat.id} className="bg-neutral-900 border border-neutral-800 rounded px-4 py-3 flex items-center justify-between hover:border-neutral-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: cat.color || '#fff' }} />
                      <div>
                        <p className="text-white text-sm font-medium">{cat.name}</p>
                        {cat.description && <p className="text-neutral-500 text-xs">{cat.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-neutral-600 text-xs">{count} doc{count !== 1 ? 's' : ''}</span>
                      <button onClick={() => startEdit(cat)} className="text-neutral-500 text-xs hover:text-white transition-colors">Edit</button>
                      <button onClick={() => handleDelete(cat.id)} className="text-neutral-500 text-xs hover:text-red-400 transition-colors">Delete</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}