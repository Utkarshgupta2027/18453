import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  AppBar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  CssBaseline,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
  createTheme,
} from '@mui/material'
import {
  DoneAll,
  FilterList,
  Inbox,
  NotificationsActive,
  PriorityHigh,
  Refresh,
  Visibility,
} from '@mui/icons-material'
import './App.css'
import { getNotifications } from './services/notificationService'
import { createLogger } from '../../logging_middleware/browserLogger'
import { login as authLogin, logout as authLogout, getCurrentUser } from './services/authService'
import {
  formatNotificationTime,
  getNotificationId,
  getNotificationMessage,
  getNotificationType,
  getPriorityNotifications,
  sortByNewest,
} from './utils/notifications'

const logger = createLogger('notification_app_fe')

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2457c5' },
    secondary: { main: '#00856f' },
    background: {
      default: '#f7f8fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#172033',
      secondary: '#5b6578',
    },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontSize: '2rem', fontWeight: 800, letterSpacing: 0 },
    h2: { fontSize: '1.35rem', fontWeight: 800, letterSpacing: 0 },
    h3: { fontSize: '1.05rem', fontWeight: 800, letterSpacing: 0 },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: 0 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #e1e6ef',
          boxShadow: '0 10px 28px rgba(33, 43, 70, 0.06)',
        },
      },
    },
  },
})

function App() {
  const [activePage, setActivePage] = useState('all')
  const [notifications, setNotifications] = useState([])
  const [viewedIds, setViewedIds] = useState(() => loadViewedIds())
  const [notificationType, setNotificationType] = useState('All')
  const [priorityLimit, setPriorityLimit] = useState(10)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [status, setStatus] = useState({ loading: false, error: '' })
  const [user, setUser] = useState(getCurrentUser())
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [authError, setAuthError] = useState('')

  const types = useMemo(() => {
    const found = new Set(notifications.map(getNotificationType).filter(Boolean))
    return ['All', ...Array.from(found).sort()]
  }, [notifications])

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !viewedIds.has(getNotificationId(item))),
    [notifications, viewedIds],
  )

  const filteredNotifications = useMemo(() => {
    return sortByNewest(notifications).filter((item) => {
      const matchesType =
        notificationType === 'All' || getNotificationType(item) === notificationType
      const matchesUnread =
        !showUnreadOnly || !viewedIds.has(getNotificationId(item))
      return matchesType && matchesUnread
    })
  }, [notificationType, notifications, showUnreadOnly, viewedIds])

  const priorityNotifications = useMemo(
    () =>
      getPriorityNotifications(unreadNotifications, {
        limit: priorityLimit,
        type: notificationType,
      }),
    [notificationType, priorityLimit, unreadNotifications],
  )

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  useEffect(() => {
    localStorage.setItem('viewedNotificationIds', JSON.stringify([...viewedIds]))
  }, [viewedIds])

  async function fetchNotifications() {
    const startedAt = performance.now()
    setStatus({ loading: true, error: '' })

    try {
      const data = await getNotifications()
      setNotifications(data)
      setStatus({ loading: false, error: '' })
      logger.info('Fetched notifications', {
        count: data.length,
        durationMs: Math.round(performance.now() - startedAt),
      })
    } catch (error) {
      setStatus({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load notifications right now.',
      })
      logger.error('Failed to fetch notifications', {
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }

  function markViewed(id) {
    setViewedIds((current) => {
      const next = new Set(current)
      next.add(id)
      return next
    })
    logger.info('Marked notification as viewed', { id })
  }

  function handleLogin(event) {
    event.preventDefault()
    const result = authLogin(credentials)
    if (!result.success) {
      setAuthError(result.message)
      return
    }

    setUser(result.user)
    setAuthError('')
  }

  function handleLogout() {
    authLogout()
    setUser(null)
    setNotifications([])
    setViewedIds(new Set())
    setStatus({ loading: false, error: '' })
  }

  function markAllViewed(list) {
    setViewedIds((current) => {
      const next = new Set(current)
      list.forEach((item) => next.add(getNotificationId(item)))
      return next
    })
    logger.info('Marked notifications as viewed', { count: list.length })
  }

  const visibleList = activePage === 'priority' ? priorityNotifications : filteredNotifications

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box className="appShell">
          <Container maxWidth="sm" className="mainContent">
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack spacing={1}>
                    <Typography variant="h2">Campus Notifications Login</Typography>
                    <Typography color="text.secondary">
                      Enter any username and password to continue. This is a frontend-only login middleware.
                    </Typography>
                  </Stack>

                  {authError && <Alert severity="error">{authError}</Alert>}

                  <form onSubmit={handleLogin}>
                    <Stack spacing={2}>
                      <TextField
                        label="Username"
                        value={credentials.username}
                        onChange={(event) =>
                          setCredentials((current) => ({
                            ...current,
                            username: event.target.value,
                          }))
                        }
                        autoComplete="username"
                        fullWidth
                      />
                      <TextField
                        label="Password"
                        type="password"
                        value={credentials.password}
                        onChange={(event) =>
                          setCredentials((current) => ({
                            ...current,
                            password: event.target.value,
                          }))
                        }
                        autoComplete="current-password"
                        fullWidth
                      />
                      <Button type="submit" variant="contained" size="large">
                        Sign in
                      </Button>
                    </Stack>
                  </form>
                </Stack>
              </CardContent>
            </Card>
          </Container>
        </Box>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="appShell">
        <AppBar position="sticky" color="inherit" elevation={0} className="topBar">
          <Toolbar className="toolbar">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box className="brandMark">
                <NotificationsActive fontSize="small" />
              </Box>
              <Box>
                <Typography variant="h1">Campus Notifications</Typography>
                <Typography variant="body2" color="text.secondary">
                  Priority inbox and notification history
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Refresh notifications">
                <span>
                  <IconButton
                    color="primary"
                    onClick={fetchNotifications}
                    disabled={status.loading}
                    aria-label="Refresh notifications"
                  >
                    <Refresh />
                  </IconButton>
                </span>
              </Tooltip>
              <Badge badgeContent={unreadNotifications.length} color="error">
                <Inbox color="action" />
              </Badge>
            </Stack>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" className="mainContent">
          <Grid container spacing={2.5}>
            <Grid item xs={12} lg={3}>
              <Stack spacing={2}>
                <Card>
                  <CardContent>
                    <Typography variant="h2">Overview</Typography>
                    <Stack spacing={1.5} mt={2}>
                      <Metric label="Total" value={notifications.length} />
                      <Metric label="Unread" value={unreadNotifications.length} tone="urgent" />
                      <Metric label="Priority shown" value={priorityNotifications.length} />
                    </Stack>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <FilterList color="primary" />
                      <Typography variant="h2">Controls</Typography>
                    </Stack>
                    <Stack spacing={2} mt={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="type-filter-label">Type</InputLabel>
                        <Select
                          labelId="type-filter-label"
                          value={notificationType}
                          label="Type"
                          onChange={(event) => setNotificationType(event.target.value)}
                        >
                          {types.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth size="small">
                        <InputLabel id="priority-limit-label">Priority limit</InputLabel>
                        <Select
                          labelId="priority-limit-label"
                          value={priorityLimit}
                          label="Priority limit"
                          onChange={(event) => setPriorityLimit(Number(event.target.value))}
                        >
                          {[5, 10, 15, 20].map((limit) => (
                            <MenuItem key={limit} value={limit}>
                              Top {limit}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography variant="body2" color="text.secondary">
                          Unread only
                        </Typography>
                        <Switch
                          checked={showUnreadOnly}
                          onChange={(event) => setShowUnreadOnly(event.target.checked)}
                          inputProps={{ 'aria-label': 'Show unread notifications only' }}
                        />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>

            <Grid item xs={12} lg={9}>
              <Card className="workspaceCard">
                <CardContent>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'stretch', md: 'center' }}
                    spacing={2}
                  >
                    <Tabs
                      value={activePage}
                      onChange={(_, nextPage) => setActivePage(nextPage)}
                      aria-label="Notification pages"
                    >
                      <Tab value="all" label="All Notifications" />
                      <Tab value="priority" label="Priority Inbox" />
                    </Tabs>
                    <Button
                      variant="contained"
                      startIcon={<DoneAll />}
                      onClick={() => markAllViewed(visibleList)}
                      disabled={visibleList.length === 0}
                    >
                      Mark visible viewed
                    </Button>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  {status.error && (
                    <Alert severity="error" sx={{ mb: 2 }} action={
                      <Button color="inherit" size="small" onClick={fetchNotifications}>
                        Retry
                      </Button>
                    }>
                      {status.error}
                    </Alert>
                  )}

                  {status.loading ? (
                    <Stack alignItems="center" justifyContent="center" className="loadingState">
                      <CircularProgress />
                      <Typography color="text.secondary">Loading notifications</Typography>
                    </Stack>
                  ) : (
                    <NotificationList
                      title={
                        activePage === 'priority'
                          ? `Top ${priorityLimit} unread priority notifications`
                          : 'Notification feed'
                      }
                      notifications={visibleList}
                      viewedIds={viewedIds}
                      onView={markViewed}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

function Metric({ label, value, tone = 'normal' }) {
  return (
    <Box className={`metric metric-${tone}`}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h3">{value}</Typography>
    </Box>
  )
}

function NotificationList({ title, notifications, viewedIds, onView }) {
  if (notifications.length === 0) {
    return (
      <Stack alignItems="center" justifyContent="center" className="emptyState">
        <Inbox color="disabled" sx={{ fontSize: 52 }} />
        <Typography variant="h2">{title}</Typography>
        <Typography color="text.secondary">No notifications match the current view.</Typography>
      </Stack>
    )
  }

  return (
    <Stack spacing={1.25}>
      <Typography variant="h2">{title}</Typography>
      {notifications.map((item) => {
        const id = getNotificationId(item)
        const isViewed = viewedIds.has(id)

        return (
          <Card key={id} className={isViewed ? 'notification viewed' : 'notification unread'}>
            <CardContent className="notificationContent">
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box className="notificationIcon">
                  {isViewed ? <Visibility fontSize="small" /> : <PriorityHigh fontSize="small" />}
                </Box>
                <Box flex={1} minWidth={0}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={1}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Chip
                        size="small"
                        color={isViewed ? 'default' : 'primary'}
                        label={getNotificationType(item)}
                      />
                      {!isViewed && <Chip size="small" color="error" label="New" />}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {formatNotificationTime(item)}
                    </Typography>
                  </Stack>
                  <Typography className="messageText">{getNotificationMessage(item)}</Typography>
                </Box>
                <Tooltip title="Mark as viewed">
                  <span>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onView(id)}
                      disabled={isViewed}
                      aria-label="Mark as viewed"
                    >
                      <DoneAll fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            </CardContent>
          </Card>
        )
      })}
    </Stack>
  )
}

function loadViewedIds() {
  try {
    const stored = JSON.parse(localStorage.getItem('viewedNotificationIds') || '[]')
    return new Set(Array.isArray(stored) ? stored : [])
  } catch {
    return new Set()
  }
}

export default App
