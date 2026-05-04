const API_PATH = '/api/notifications'

export async function getNotifications({ limit, page, notificationType } = {}) {
  const params = new URLSearchParams()

  if (limit) params.set('limit', String(limit))
  if (page) params.set('page', String(page))
  if (notificationType && notificationType !== 'All') {
    params.set('notification_type', notificationType)
  }

  const url = params.size ? `${API_PATH}?${params.toString()}` : API_PATH
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Backend reached the notification API, but the API token is missing or expired.')
    }

    throw new Error(`Notification backend returned ${response.status}`)
  }

  const payload = await response.json()
  const notifications = Array.isArray(payload) ? payload : payload.notifications

  if (!Array.isArray(notifications)) {
    throw new Error('Notification API response did not include a notifications array')
  }

  return notifications
}
