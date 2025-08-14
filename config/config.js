// Import dependencies
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send('OK'))

// Connect to MongoDB if configured
if (process.env.MONGO_URI) {
	mongoose.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}).then(() => console.log('MongoDB Connected'))
		.catch(err => console.error('MongoDB Connection Error:', err));
} else {
	console.log('MONGO_URI not set; skipping MongoDB connection');
}

const PORT = process.env.PORT || 5000;

export { app, PORT };
