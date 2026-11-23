import { Link, Outlet, useMatch } from 'react-router-dom'

function AuthLayout() {
  const isSignup = useMatch('/signup') !== null

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">
          {isSignup ? 'Signup Form' : 'Login Form'}
        </h1>

        <div className="auth-tabs">
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

        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
