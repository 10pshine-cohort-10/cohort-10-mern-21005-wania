import { useRef, useState, type FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { loginUser } from '../services/authService'

function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Prevent repeated submissions
  const [isPending, setIsPending] = useState(false)
  const isSubmitting = useRef(false)

  // Clear old messages when the user edits either field
  const handleInputChange = () => {
    setError('')
    setSuccess('')
  }

  // Handle login form submission
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting.current) return

    isSubmitting.current = true
    setIsPending(true)

    setError('')
    setSuccess('')

    const formData = new FormData(event.currentTarget)

    const email = String(formData.get('email') || '')
    const password = String(formData.get('password') || '')

    try {
      const data = await loginUser({ email, password })

      localStorage.setItem('token', data.token)
      setSuccess('Login successful')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Login failed'

      setError(message)
    } finally {
      isSubmitting.current = false
      setIsPending(false)
    }
  }

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
          onChange={handleInputChange}
          required
        />
      </div>

      {/* Password field */}
      <div className="form-group">
        <div className="password-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            placeholder="Password"
            aria-label="Password"
            onChange={handleInputChange}
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

      {/* Login messages */}
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      {/* Login button */}
      <button
        type="submit"
        className="auth-button"
        disabled={isPending}
      >
        {isPending ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}

export default Login
