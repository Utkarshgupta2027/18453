const LOG_STORAGE_KEY = 'notificationAppLogs'

export function createLogger(source) {
  return {
    info(message, context = {}) {
      writeLog('info', source, message, context)
    },
    warn(message, context = {}) {
      writeLog('warn', source, message, context)
    },
    error(message, context = {}) {
      writeLog('error', source, message, context)
    },
  }
}

function writeLog(level, source, message, context) {
  const entry = {
    level,
    source,
    message,
    context,
    timestamp: new Date().toISOString(),
  }

  try {
    const current = JSON.parse(localStorage.getItem(LOG_STORAGE_KEY) || '[]')
    const next = Array.isArray(current) ? current.slice(-199) : []
    next.push(entry)
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Logging must never block the application path.
  }
}
