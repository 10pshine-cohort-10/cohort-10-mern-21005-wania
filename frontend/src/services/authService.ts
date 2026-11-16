
// Signup form data
type SignupData = {
  name: string
  email: string
  password: string
}

// Login form data
type LoginData = {
  email: string
  password: string
}

// Send signup details to the backend
export const signupUser = async (userData: SignupData) => {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Signup failed')
  }

  return data
}

// Send login details to the backend
export const loginUser = async (userData: LoginData) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Login failed')
  }

  return data
}
