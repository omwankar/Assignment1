import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/api/register', authController.register);
router.post('/api/login', authController.login);

export default router;
