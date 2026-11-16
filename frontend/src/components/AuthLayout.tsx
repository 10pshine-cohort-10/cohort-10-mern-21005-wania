
import { Link, Outlet, useLocation } from 'react-router-dom'

function AuthLayout() {
  // Get the current page URL
  const location = useLocation()

  // Check if the signup page is open
  const isSignup = location.pathname === '/signup'

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Change heading based on the current page */}
        <h1 className="auth-title">
          {isSignup ? 'Signup Form' : 'Login Form'}
        </h1>

        {/* Login and signup tabs */}
        <div className="auth-tabs">
          {/* Moves the slider to the active tab */}
          <span
            className={`auth-tab-slider ${isSignup ? 'signup-active' : ''}`}
          />

          <Link
            to="/login"
            className={`auth-tab ${!isSignup ? 'active' : ''}`}
          >
            Login
          </Link>

          <Link
            to="/signup"
            className={`auth-tab ${isSignup ? 'active' : ''}`}
          >
            Signup
          </Link>
        </div>

        {/* Display the selected page */}
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
