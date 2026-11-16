
import { useState, type FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { loginUser } from '../services/authService'

function Login() {
  // Password visibility
  const [showPassword, setShowPassword] = useState(false)

  // Login messages
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Handle login form submission
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setEmailError('')
    setPasswordError('')
    setError('')
    setSuccess('')

    // Get values from the form
    const formData = new FormData(event.currentTarget)

    const email = String(formData.get('email') || '')
    const password = String(formData.get('password') || '')

    // Send login details to the backend
    try {
      const data = await loginUser({ email, password })

      // Save the login token
      localStorage.setItem('token', data.token)

      setSuccess('Login successful')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Login failed'

      if (message === 'Invalid email') {
        setEmailError(message)
      } else if (message === 'Password is incorrect') {
        setPasswordError(message)
      } else {
        setError(message)
      }
    }
  }

  // Login form
  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {/* Email field */}
      <div className="form-group">
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Email Address"
          aria-label="Email Address"
          required
        />
      </div>

      {emailError && <p className="error-message">{emailError}</p>}

      {/* Password field */}
      <div className="form-group">
        <div className="password-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            placeholder="Password"
            aria-label="Password"
            required
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {passwordError && <p className="error-message">{passwordError}</p>}

      {/* General login messages */}
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      {/* Login button */}
      <button type="submit" className="auth-button">
        Login
      </button>
    </form>
  )
}

export default Login
