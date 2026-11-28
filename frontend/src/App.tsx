import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from './components/AuthLayout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import './App.css'

function ProtectedRoute() {
  return localStorage.getItem('token') ? (
    <Dashboard />
  ) : (
    <Navigate to="/login" replace />
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        <Route path="/dashboard" element={<ProtectedRoute />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
