# Live Polling System

Backend: Express + Socket.io
Frontend: React (Vite) + socket.io-client

## Run Locally

- Backend
```
cd /workspace
npm install
npm run dev
```
Server listens on PORT (default 5000).

- Frontend
```
cd /workspace/client
npm install
npm run dev
```
Vite runs on 5173 and proxies /api and /socket.io to backend.

Optional `.env` for backend:
```
PORT=5000
MONGO_URI= # optional
JWT_SECRET=dev-secret
```

Optional `.env` for frontend:
```
VITE_API_BASE=http://localhost:5000
```

## Features
- Teacher: create poll, ask question, see live results, remove student
- Student: join by name + pollId, answer within 60s, see results
- Auto-end on timer or when all students answered

## Deploy
- Host backend (Render/Heroku/Fly) and set CORS to allow frontend origin
- Build frontend: `npm run build` in `client/` and host static output in any static host (Netlify/Vercel)
- Set `VITE_API_BASE` to your backend URL