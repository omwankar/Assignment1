import { app, PORT } from './config/config.js';
import authRoutes from './routes/authRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import pollRoutes from './routes/pollRoutes.js';
import { registerPollSocketHandlers } from './sockets/pollSocket.js';

const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*'} });

app.use(authRoutes);
app.use(referralRoutes);
app.use('/api/polls', pollRoutes);

registerPollSocketHandlers(io);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
