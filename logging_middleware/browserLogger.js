const LOG_STORAGE_KEY = 'notificationAppLogs'
const DEFAULT_ENDPOINT = '/api/logs'
const MAX_STORED_LOGS = 200

const STACKS = new Set(['frontend', 'backend'])
const LEVELS = new Set(['debug', 'info', 'warn', 'error', 'fatal'])
const PACKAGES = new Set([
  'api',
  'component',
  'hook',
  'page',
  'state',
  'style',
  'auth',
  'config',
  'middleware',
  'utils',
])

const loggerConfig = {
  endpoint: DEFAULT_ENDPOINT,
  getToken: undefined,
}

export function configureLogger(options = {}) {
  loggerConfig.endpoint = options.endpoint ?? loggerConfig.endpoint
  loggerConfig.getToken = options.getToken ?? loggerConfig.getToken
}

export async function Log(stack, level, packageName, message) {
  const entry = createLogEntry(stack, level, packageName, message)
  persistLog(entry)
  return sendLog(entry)
}

export function createLogger(packageName, options = {}) {
  configureLogger(options)

  return {
    debug(message, context = {}) {
      return Log('frontend', 'debug', packageName, formatMessage(message, context))
    },
    info(message, context = {}) {
      return Log('frontend', 'info', packageName, formatMessage(message, context))
    },
    warn(message, context = {}) {
      return Log('frontend', 'warn', packageName, formatMessage(message, context))
    },
    error(message, context = {}) {
      return Log('frontend', 'error', packageName, formatMessage(message, context))
    },
    fatal(message, context = {}) {
      return Log('frontend', 'fatal', packageName, formatMessage(message, context))
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

function createLogEntry(stack, level, packageName, message) {
  const entry = {
    stack: normalizeValue(stack, STACKS, 'frontend'),
    level: normalizeValue(level, LEVELS, 'info'),
    package: normalizeValue(packageName, PACKAGES, 'component'),
    message: String(message || 'Application event'),
  }

  return {
    ...entry,
    timestamp: new Date().toISOString(),
  }
}

function normalizeValue(value, allowedValues, fallback) {
  const normalized = String(value || '').trim().toLowerCase()
  return allowedValues.has(normalized) ? normalized : fallback
}

function formatMessage(message, context) {
  const text = message instanceof Error ? message.message : String(message)
  if (!context || typeof context !== 'object' || !Object.keys(context).length) {
    return text
  }

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

async function sendLog(entry) {
  if (typeof fetch !== 'function') return undefined

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
  const token = loggerConfig.getToken?.()
  if (token) headers['X-Notification-Token'] = token

  try {
    const response = await fetch(loggerConfig.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        stack: entry.stack,
        level: entry.level,
        package: entry.package,
        message: entry.message,
      }),
      keepalive: true,
    })

    return response
  } catch {
    return undefined
  }
}

function getStorage() {
  if (typeof localStorage === 'undefined') return undefined
  return localStorage
}
