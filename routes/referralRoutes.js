import express from 'express';
import * as referralController from '../controllers/referralController.js';

const router = express.Router();

router.get('/api/referrals', referralController.getReferrals);

export default router;
