type SignupData = {
  name: string
  email: string
  password: string
}

type LoginData = {
  email: string
  password: string
}

type User = {
  id: number
  name: string
  email: string
}

type SignupResponse = {
  message?: string
  user?: User
}

type LoginResponse = {
  token: string
  user: User
}

type ApiErrorResponse = {
  message?: string
}

// Send signup details to the backend
export const signupUser = async (
  userData: SignupData,
): Promise<SignupResponse> => {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const data: SignupResponse & ApiErrorResponse =
      await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.message || 'Signup failed')
    }

    return data
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Signup failed',
    )
  }
}

// Send login details to the backend
export const loginUser = async (
  userData: LoginData,
): Promise<LoginResponse> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const data: Partial<LoginResponse> & ApiErrorResponse =
      await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.message || 'Login failed')
    }

    const isValidResponse =
      typeof data.token === 'string' &&
      data.token.length > 0 &&
      typeof data.user?.id === 'number' &&
      typeof data.user?.name === 'string' &&
      typeof data.user?.email === 'string'

    if (!isValidResponse) {
      throw new Error('Invalid login response from server')
    }

    return data as LoginResponse
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Login failed',
    )
  }
}
