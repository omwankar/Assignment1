import { createPoll as createPollStore, askQuestion as askQuestionStore, getPollById, computeResults } from '../services/pollStore.js';

export const createPoll = async (req, res) => {
	try {
		const { title, timeLimitSeconds } = req.body;
		const poll = createPollStore({ title: title || 'Live Poll', timeLimitSeconds: timeLimitSeconds || 60 });
		return res.status(201).json(poll);
	} catch (error) {
		return res.status(500).json({ message: 'Failed to create poll', error });
	}
};

export const askQuestion = async (req, res) => {
	try {
		const { pollId } = req.params;
		const { questionText, options } = req.body;
		const result = askQuestionStore(pollId, { questionText, options });
		if (result === null) return res.status(404).json({ message: 'Poll not found' });
		if (result === 'ACTIVE_QUESTION_EXISTS') return res.status(400).json({ message: 'Previous question still active' });
		return res.json(result);
	} catch (error) {
		return res.status(500).json({ message: 'Failed to ask question', error });
	}
};

export const getPoll = async (req, res) => {
	try {
		const { pollId } = req.params;
		const poll = getPollById(pollId);
		if (!poll) return res.status(404).json({ message: 'Poll not found' });
		return res.json(poll);
	} catch (error) {
		return res.status(500).json({ message: 'Failed to fetch poll', error });
	}
};

export const getResults = async (req, res) => {
	try {
		const { pollId } = req.params;
		const poll = getPollById(pollId);
		if (!poll) return res.status(404).json({ message: 'Poll not found' });
		const results = poll.currentQuestion ? computeResults(poll.currentQuestion) : {};
		return res.json({ results, currentQuestion: poll.currentQuestion });
	} catch (error) {
		return res.status(500).json({ message: 'Failed to fetch results', error });
	}
};

export const getHistory = async (req, res) => {
	try {
		const { pollId } = req.params;
		const poll = getPollById(pollId);
		if (!poll) return res.status(404).json({ message: 'Poll not found' });
		return res.json({ pastQuestions: poll.pastQuestions || [] });
	} catch (error) {
		return res.status(500).json({ message: 'Failed to fetch history', error });
	}
};

