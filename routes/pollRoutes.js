import express from 'express';
import * as pollController from '../controllers/pollController.js';

const router = express.Router();

router.post('/', pollController.createPoll);
router.post('/:pollId/question', pollController.askQuestion);
router.get('/:pollId', pollController.getPoll);
router.get('/:pollId/results', pollController.getResults);
router.get('/:pollId/history', pollController.getHistory);

export default router;