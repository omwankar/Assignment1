import { getPollById, askQuestion as askQuestionStore, recordAnswer as recordAnswerStore, computeResults, finalizeQuestion as finalizeQuestionStore } from '../services/pollStore.js';
import { v4 as uuidv4 } from 'uuid';

const rooms = new Map();

export function registerPollSocketHandlers(io) {
	io.on('connection', (socket) => {
		socket.on('teacher:createPollRoom', ({ pollId }) => {
			socket.join(pollId);
			rooms.set(pollId, rooms.get(pollId) || { students: new Map(), studentSockets: new Map(), timers: {} });
			socket.emit('teacher:roomJoined', { pollId });
		});

		socket.on('student:join', async ({ pollId, name }) => {
			const studentId = uuidv4();
			socket.join(pollId);
			socket.data = { pollId, studentId };
			const room = rooms.get(pollId) || { students: new Map(), studentSockets: new Map(), timers: {} };
			room.students.set(studentId, { name, answered: false });
			room.studentSockets.set(studentId, socket.id);
			rooms.set(pollId, room);
			io.to(pollId).emit('room:students', Array.from(room.students.entries()).map(([id, s]) => ({ id, ...s })));

			const poll = getPollById(pollId);
			if (poll && poll.currentQuestion) {
				socket.emit('question:asked', poll.currentQuestion);
			}
			socket.emit('student:registered', { studentId });
		});

		socket.on('teacher:askQuestion', async ({ pollId, questionText, options }) => {
			const existing = getPollById(pollId);
			if (!existing) return socket.emit('error', { message: 'Poll not found' });

			if (existing.currentQuestion) {
				const room = rooms.get(pollId) || { students: new Map() };
				const totalStudents = room.students.size;
				const answeredCount = Object.keys(existing.currentQuestion.answers || {}).length;
				const allAnswered = answeredCount >= totalStudents;
				if (allAnswered) {
					clearExistingTimer(pollId);
					await finalizeQuestionFlow(io, pollId);
				} else {
					return socket.emit('error', { message: 'Previous question still active' });
				}
			}

			const updated = askQuestionStore(pollId, { questionText, options });
			if (updated === null) return socket.emit('error', { message: 'Poll not found' });
			const poll = updated;
			io.to(pollId).emit('question:asked', poll.currentQuestion);

			clearExistingTimer(pollId);
			const endsAtMs = new Date(poll.currentQuestion.endsAt).getTime();
			const interval = setInterval(async () => {
				const remainingMs = endsAtMs - Date.now();
				if (remainingMs <= 0) {
					clearExistingTimer(pollId);
					await finalizeQuestionFlow(io, pollId);
				} else {
					io.to(pollId).emit('question:timer', { remainingMs });
				}
			}, 1000);
			rooms.set(pollId, { ...(rooms.get(pollId) || { students: new Map(), studentSockets: new Map() }), timers: { interval } });
		});

					socket.on('student:answer', async ({ pollId, studentId, option }) => {
				const result = recordAnswerStore(pollId, studentId, option);
				if (!result || result === 'QUESTION_ENDED' || result === 'ALREADY_ANSWERED') return;
				const poll = getPollById(pollId);
				if (poll && poll.currentQuestion) {
					io.to(pollId).emit('results:update', computeResults(poll.currentQuestion));

					// Auto-end early if all students answered
					const room = rooms.get(pollId) || { students: new Map() };
					const totalStudents = room.students.size;
					const answeredCount = Object.keys(poll.currentQuestion.answers || {}).length;
					if (totalStudents > 0 && answeredCount >= totalStudents) {
						clearExistingTimer(pollId);
						await finalizeQuestionFlow(io, pollId);
					}
				}
			});

		socket.on('teacher:removeStudent', ({ pollId, studentId }) => {
			const room = rooms.get(pollId);
			if (!room) return;
			const socketId = room.studentSockets?.get(studentId);
			if (socketId) {
				const studentSocket = io.sockets.sockets.get(socketId);
				studentSocket?.leave(pollId);
				studentSocket?.emit('removedFromPoll', { pollId });
			}
			room.students.delete(studentId);
			room.studentSockets?.delete(studentId);
			io.to(pollId).emit('room:students', Array.from(room.students.entries()).map(([id, s]) => ({ id, ...s })));
		});

		socket.on('disconnect', () => {
			const { pollId, studentId } = socket.data || {};
			if (pollId && studentId && rooms.has(pollId)) {
				const room = rooms.get(pollId);
				room.students.delete(studentId);
				room.studentSockets?.delete(studentId);
				io.to(pollId).emit('room:students', Array.from(room.students.entries()).map(([id, s]) => ({ id, ...s })));
			}
		});
	});
}

function clearExistingTimer(pollId) {
	const room = rooms.get(pollId);
	if (room?.timers?.interval) clearInterval(room.timers.interval);
}

async function finalizeQuestionFlow(io, pollId) {
	const results = finalizeQuestionStore(pollId);
	if (!results) return;
	io.to(pollId).emit('question:ended', { results });
}

function computeResultsDoc(questionDoc) {
	return computeResults(questionDoc);
}