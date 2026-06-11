import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)
  const [role, setRole] = useState(null)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (u) {
        setUser(u)
        try {
          const snap = await getDoc(doc(db, 'users', u.uid))
          if (snap.exists()) {
            setRole(snap.data().role)
            setUserName(snap.data().name || u.email)
          } else {
            setRole('viewer')
            setUserName(u.email)
          }
        } catch {
          setRole('viewer')
          setUserName(u.email)
        }
      } else {
        setUser(null)
        setRole(null)
        setUserName('')
      }
    })
    return unsub
  }, [])

  const isAdmin = role === 'admin'
  const isAttachee = role === 'attachee'
  const isViewer = role === 'viewer'

  return (
    <AuthContext.Provider value={{ user, role, isAdmin, isAttachee, isViewer, userName }}>
      {user === undefined ? (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      ) : children}
    </AuthContext.Provider>
  )
}