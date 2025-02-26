import { app, PORT } from './config/config.js';
import authRoutes from './routes/authRoutes.js';
import referralRoutes from './routes/referralRoutes.js';

app.use(authRoutes);
app.use(referralRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
