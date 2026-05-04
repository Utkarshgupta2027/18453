const TYPE_WEIGHT = {
  placement: 3,
  result: 2,
  event: 1,
}

export function getNotificationId(notification) {
  return (
    notification.ID ||
    notification.id ||
    notification.notificationId ||
    notification._id ||
    [
      getNotificationType(notification),
      getNotificationMessage(notification),
      getNotificationTimestamp(notification),
    ].join('|')
  )
}

export function getNotificationType(notification) {
  return notification.Type || notification.type || 'General'
}

export function getNotificationMessage(notification) {
  return notification.Message || notification.message || 'Notification update'
}

export function getNotificationTimestamp(notification) {
  return notification.Timestamp || notification.timestamp || ''
}

export function getPriorityNotifications(notifications, { limit = 10, type = 'All' } = {}) {
  return notifications
    .filter((item) => type === 'All' || getNotificationType(item) === type)
    .slice()
    .sort((a, b) => {
      const weightDifference = getTypeWeight(b) - getTypeWeight(a)
      if (weightDifference !== 0) return weightDifference

      return getTimeValue(b) - getTimeValue(a)
    })
    .slice(0, limit)
}

export function sortByNewest(notifications) {
  return notifications.slice().sort((a, b) => getTimeValue(b) - getTimeValue(a))
}

export function formatNotificationTime(notification) {
  const value = getNotificationTimestamp(notification)
  const date = parseTimestamp(value)

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function getTypeWeight(notification) {
  return TYPE_WEIGHT[getNotificationType(notification).toLowerCase()] || 0
}

function getTimeValue(notification) {
  const date = parseTimestamp(getNotificationTimestamp(notification))
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function parseTimestamp(value) {
  if (!value) return new Date('')
  return new Date(String(value).replace(' ', 'T'))
}
