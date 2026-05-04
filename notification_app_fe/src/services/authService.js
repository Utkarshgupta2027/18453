const AUTH_STORAGE_KEY = 'notificationAppAuth'

export function loadAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return Boolean(getCurrentUser())
}

export function getCurrentUser() {
  return loadAuth()?.user ?? null
}

export function login({ username, password }) {
  const normalizedUsername = String(username || '').trim()
  const normalizedPassword = String(password || '').trim()

  if (!normalizedUsername || !normalizedPassword) {
    return { success: false, message: 'Please enter a username and password.' }
  }

  const auth = {
    user: { username: normalizedUsername },
    token: 'local-demo-token',
  }

  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
    return { success: true, user: auth.user }
  } catch (error) {
    return { success: false, message: 'Unable to save login state.' }
  }
}

export function logout() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    // ignore
  }
}
