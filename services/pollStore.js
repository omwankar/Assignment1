import { v4 as uuidv4 } from 'uuid';

const polls = new Map();

export function createPoll({ title = 'Live Poll', timeLimitSeconds = 60 }) {
  const now = new Date();
  const pollId = uuidv4();
  const poll = {
    _id: pollId,
    title,
    timeLimitSeconds,
    currentQuestion: null,
    pastQuestions: [],
    createdAt: now,
    updatedAt: now,
  };
  polls.set(pollId, poll);
  return poll;
}

export function getPollById(pollId) {
  return polls.get(pollId) || null;
}

export function savePoll(poll) {
  poll.updatedAt = new Date();
  polls.set(poll._id, poll);
  return poll;
}

export function askQuestion(pollId, { questionText, options }) {
  const poll = getPollById(pollId);
  if (!poll) return null;
  const now = new Date();
  const endsAt = new Date(now.getTime() + (poll.timeLimitSeconds * 1000));
  const hasActive = poll.currentQuestion && poll.currentQuestion.endsAt > now;
  if (hasActive) return 'ACTIVE_QUESTION_EXISTS';
  poll.currentQuestion = {
    questionText,
    options,
    startsAt: now,
    endsAt,
    answers: {},
  };
  return savePoll(poll);
}

export function recordAnswer(pollId, studentId, option) {
  const poll = getPollById(pollId);
  if (!poll || !poll.currentQuestion) return null;
  if (poll.currentQuestion.endsAt <= new Date()) return 'QUESTION_ENDED';
  if (poll.currentQuestion.answers[studentId]) return 'ALREADY_ANSWERED';
  poll.currentQuestion.answers[studentId] = option;
  return savePoll(poll);
}

export function computeResults(question) {
  const counts = {};
  (question.options || []).forEach((opt) => { counts[opt] = 0; });
  Object.values(question.answers || {}).forEach((ans) => {
    if (counts[ans] !== undefined) counts[ans] += 1;
  });
  return counts;
}

export function finalizeQuestion(pollId) {
  const poll = getPollById(pollId);
  if (!poll || !poll.currentQuestion) return null;
  const results = computeResults(poll.currentQuestion);
  poll.pastQuestions.push(poll.currentQuestion);
  poll.currentQuestion = null;
  savePoll(poll);
  return results;
}

export function listStudentsInRoom(room) {
  // helper for sockets; kept here for symmetry even if not needed by REST
  return Array.from(room.students.entries()).map(([id, s]) => ({ id, ...s }));
}