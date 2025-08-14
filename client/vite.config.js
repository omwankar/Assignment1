import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_BASE = process.env.VITE_API_BASE || 'http://localhost:5000'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		port: 5173,
		proxy: {
			'/socket.io': {
				target: API_BASE,
				ws: true,
				changeOrigin: true,
			},
			'/api': {
				target: API_BASE,
				changeOrigin: true,
			},
		},
	},
})
