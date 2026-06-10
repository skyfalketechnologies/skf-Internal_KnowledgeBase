import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }) {
  const { user, isAdmin, role } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut(auth)
    navigate('/login')
  }

  const nav = [
    { to: '/',           label: 'Home',       icon: '⊞', show: true },
    { to: '/documents',  label: 'Documents',  icon: '≡', show: true },
    { to: '/new',        label: 'New Doc',    icon: '+', show: isAdmin },
    { to: '/search',     label: 'Search',     icon: '⌕', show: true },
    { to: '/categories', label: 'Categories', icon: '◈', show: isAdmin },
  ].filter(n => n.show)

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded text-sm font-medium transition-colors ${
      isActive
        ? 'bg-white text-black'
        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
    }`

  return (
    <div className="min-h-screen bg-neutral-950 flex">
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-neutral-900 border-r border-neutral-800
        flex flex-col transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="px-6 py-5 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded flex items-center justify-center">
              <span className="text-black text-xs font-black">KB</span>
            </div>
            <span className="text-white font-bold text-sm tracking-wide">KnowledgeBase</span>
          </div>
          <p className="text-neutral-600 text-xs mt-1">Skyfalke Internal</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={linkClass} onClick={() => setSidebarOpen(false)}>
              <span className="text-base w-5 text-center">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-neutral-800">
          <p className="text-neutral-500 text-xs mb-1 truncate">{user?.email}</p>
          <p className="text-neutral-600 text-xs mb-3 capitalize">{role}</p>
          <button
            onClick={handleSignOut}
            className="w-full text-left text-sm text-neutral-400 hover:text-red-400 transition-colors py-1"
          >
            Sign out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex items-center justify-between lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-white text-xl">☰</button>
          <span className="text-white font-bold text-sm">KnowledgeBase</span>
          <div className="w-6" />
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}