const LOG_STORAGE_KEY = 'notificationAppLogs'
const DEFAULT_ENDPOINT = '/api/logs'
const MAX_STORED_LOGS = 200
const LEVELS = new Set(['debug', 'info', 'warn', 'error', 'fatal'])

export function createLogger(source, options = {}) {
  const config = {
    endpoint: options.endpoint ?? DEFAULT_ENDPOINT,
    getToken: options.getToken,
    sendRemote: options.sendRemote ?? true,
  }

  return {
    debug(message, context = {}) {
      writeLog('debug', source, message, context, config)
    },
    info(message, context = {}) {
      writeLog('info', source, message, context, config)
    },
    warn(message, context = {}) {
      writeLog('warn', source, message, context, config)
    },
    error(message, context = {}) {
      writeLog('error', source, message, context, config)
    },
    fatal(message, context = {}) {
      writeLog('fatal', source, message, context, config)
    },
  }
}

export function getStoredLogs() {
  try {
    const stored = getStorage()?.getItem(LOG_STORAGE_KEY)
    const parsed = JSON.parse(stored || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function clearStoredLogs() {
  try {
    getStorage()?.removeItem(LOG_STORAGE_KEY)
  } catch {
    // Logging helpers must never block the application path.
  }
}

function writeLog(level, source, message, context, config) {
  const entry = createLogEntry(level, source, message, context)
  persistLog(entry)

  if (config.sendRemote) {
    sendLog(entry, config)
  }

  return entry
}

function createLogEntry(level, source, message, context) {
  const safeLevel = LEVELS.has(level) ? level : 'info'
  const safeContext = context && typeof context === 'object' ? context : { value: context }

  return {
    stack: 'frontend',
    level: safeLevel,
    package: source || 'notification_app_fe',
    message: formatMessage(message, safeContext),
    context: safeContext,
    timestamp: new Date().toISOString(),
  }
}

function formatMessage(message, context) {
  const text = message instanceof Error ? message.message : String(message)
  if (!Object.keys(context).length) return text

  try {
    return `${text} ${JSON.stringify(context)}`
  } catch {
    return text
  }
}

function persistLog(entry) {
  try {
    const current = getStoredLogs()
    const next = current.slice(-(MAX_STORED_LOGS - 1))
    next.push(entry)
    getStorage()?.setItem(LOG_STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Logging must never block the application path.
  }
}

function sendLog(entry, config) {
  if (typeof fetch !== 'function') return

  try {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
    const token = config.getToken?.()
    if (token) headers['X-Notification-Token'] = token

    fetch(config.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        stack: entry.stack,
        level: entry.level,
        package: entry.package,
        message: entry.message,
      }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // Remote logging is best-effort.
  }
}

function getStorage() {
  if (typeof localStorage === 'undefined') return undefined
  return localStorage
}
