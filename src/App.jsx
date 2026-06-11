import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthProvider from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Home from './pages/Home'
import Documents from './pages/Documents'
import NewDocument from './pages/NewDocument'
import EditDocument from './pages/EditDocument'
import ViewDocument from './pages/ViewDocument'
import Search from './pages/Search'
import Categories from './pages/Categories'
import ReviewQueue from './pages/ReviewQueue'
import MySubmissions from './pages/MySubmissions'

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedLayout><Home /></ProtectedLayout>} />
          <Route path="/documents" element={<ProtectedLayout><Documents /></ProtectedLayout>} />
          <Route path="/documents/:id" element={<ProtectedLayout><ViewDocument /></ProtectedLayout>} />
          <Route path="/new" element={<ProtectedLayout><NewDocument /></ProtectedLayout>} />
          <Route path="/edit/:id" element={<ProtectedLayout><EditDocument /></ProtectedLayout>} />
          <Route path="/search" element={<ProtectedLayout><Search /></ProtectedLayout>} />
          <Route path="/categories" element={<ProtectedLayout><Categories /></ProtectedLayout>} />
          <Route path="/review-queue" element={<ProtectedLayout><ReviewQueue /></ProtectedLayout>} />
          <Route path="/my-submissions" element={<ProtectedLayout><MySubmissions /></ProtectedLayout>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}