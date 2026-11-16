
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from './components/AuthLayout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Shared layout for login and signup */}
        <Route element={<AuthLayout />}>
          {/* Redirect the home page to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Login and signup pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
