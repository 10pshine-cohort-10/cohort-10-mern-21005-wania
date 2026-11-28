import { useRef, useState, type FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { signupUser } from '../services/authService'

function Signup() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)

  const isSubmitting = useRef(false)
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting.current) return

    setError('')

    const formData = new FormData(event.currentTarget)

    const name = String(formData.get('name') || '')
    const email = String(formData.get('email') || '')
    const password = String(formData.get('password') || '')
    const confirmPassword = String(formData.get('confirmPassword') || '')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    isSubmitting.current = true
    setIsPending(true)

    try {
      await signupUser({ name, email, password })
      navigate('/login')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Signup failed')
    } finally {
      isSubmitting.current = false
      setIsPending(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Full Name"
          aria-label="Full Name"
          autoComplete="name"
          required
        />
      </div>

      <div className="form-group">
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Email Address"
          aria-label="Email Address"
          autoComplete="email"
          required
        />
      </div>

      <div className="form-group">
        <div className="password-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            placeholder="Password"
            aria-label="Password"
            autoComplete="new-password"
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

      <div className="form-group">
        <div className="password-input-wrapper">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm Password"
            aria-label="Confirm Password"
            autoComplete="new-password"
            required
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <button type="submit" className="auth-button" disabled={isPending}>
        {isPending ? 'Creating account...' : 'Signup'}
      </button>
    </form>
  )
}

export default Signup
