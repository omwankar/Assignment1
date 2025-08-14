import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
	questionText: { type: String, required: true },
	options: { type: [String], required: true },
	startsAt: { type: Date, required: true },
	endsAt: { type: Date, required: true },
	answers: { type: Map, of: String, default: {} }, // studentId -> option
});

const PollSchema = new mongoose.Schema({
	title: { type: String, required: true },
	timeLimitSeconds: { type: Number, default: 60 },
	currentQuestion: { type: QuestionSchema, default: null },
	pastQuestions: { type: [QuestionSchema], default: [] },
}, { timestamps: true });

export default mongoose.model('Poll', PollSchema);