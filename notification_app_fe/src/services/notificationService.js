const API_PATH = '/api/notifications'
const TOKEN_PATH = '/api/auth/token'
const TOKEN_STORAGE_KEY = 'notificationApiToken'

export async function getNotifications({ limit, page, notificationType } = {}) {
  const params = new URLSearchParams()

  if (limit) params.set('limit', String(limit))
  if (page) params.set('page', String(page))
  if (notificationType && notificationType !== 'All') {
    params.set('notification_type', notificationType)
  }

  const url = params.size ? `${API_PATH}?${params.toString()}` : API_PATH
  const token = getStoredToken()
  const headers = { Accept: 'application/json' }
  if (token) headers['X-Notification-Token'] = token

  const response = await fetch(url, { headers })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Backend reached the notification API, but the API token is missing or expired.')
    }

    throw new Error(`Notification backend returned ${response.status}`)
  }

  const payload = await response.json()
  const notifications = extractNotifications(payload)

  if (!Array.isArray(notifications)) {
    throw new Error('Notification API response did not include a notifications array')
  }

  return notifications
}

export async function generateToken(credentials) {
  const response = await fetch(TOKEN_PATH, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    throw new Error(`Token generation failed with status ${response.status}`)
  }

  const payload = await response.json()
  const token = payload.access_token || payload.accessToken

  if (!token) {
    throw new Error('Token response did not include an access token')
  }

  saveStoredToken(token)
  return token
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || ''
}

export function saveStoredToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token.trim())
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

function extractNotifications(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.notifications)) return payload.notifications
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.notifications)) return payload.data.notifications
  return undefined
}
