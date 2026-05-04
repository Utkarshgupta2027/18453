import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const notificationToken = env.VITE_NOTIFICATION_API_TOKEN

  return {
    plugins: [react()],
    server: {
      host: '127.0.0.1',
      port: 3000,
      strictPort: true,
      fs: {
        allow: ['..'],
      },
      proxy: {
        '/evaluation-service': {
          target: 'http://20.207.122.201',
          changeOrigin: true,
          headers: notificationToken
            ? {
                Authorization: `Bearer ${notificationToken}`,
              }
            : undefined,
        },
      },
    },
  }
})
