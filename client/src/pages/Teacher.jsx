import { useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function Teacher() {
	const [pollId, setPollId] = useState('')
	const [createdPoll, setCreatedPoll] = useState(null)
	const [questionText, setQuestionText] = useState('')
	const [optionsText, setOptionsText] = useState('')
	const [timeLimit, setTimeLimit] = useState(60)
	const [timerMs, setTimerMs] = useState(0)
	const [results, setResults] = useState({})
	const [students, setStudents] = useState([])
	const socketRef = useRef(null)

	const socket = useMemo(() => {
		if (!socketRef.current) {
			socketRef.current = io(API_BASE, { transports: ['websocket'] })
		}
		return socketRef.current
	}, [])

	useEffect(() => {
		return () => { socket?.disconnect() }
	}, [socket])

	useEffect(() => {
		if (createdPoll?.timeLimitSeconds) setTimeLimit(createdPoll.timeLimitSeconds)
	}, [createdPoll])

	const handleCreatePoll = async () => {
		const res = await fetch(`${API_BASE}/api/polls`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Live Poll', timeLimitSeconds: Number(timeLimit) }) })
		const data = await res.json()
		setCreatedPoll(data)
		setPollId(data._id)
		socket.emit('teacher:createPollRoom', { pollId: data._id })
	}

	useEffect(() => {
		if (!socket) return
		socket.on('teacher:roomJoined', () => {})
		socket.on('room:students', (list) => setStudents(list))
		socket.on('results:update', (r) => setResults(r))
		socket.on('question:timer', ({ remainingMs }) => setTimerMs(remainingMs))
		socket.on('question:ended', ({ results: r }) => { setResults(r); setTimerMs(0) })
		return () => {
			socket.off('teacher:roomJoined')
			socket.off('room:students')
			socket.off('results:update')
			socket.off('question:timer')
			socket.off('question:ended')
		}
	}, [socket])

	const handleAsk = () => {
		if (!pollId) return
		const options = optionsText.split('\n').map(s => s.trim()).filter(Boolean)
		socket.emit('teacher:askQuestion', { pollId, questionText, options })
	}

	const removeStudent = (id) => {
		if (!pollId) return
		socket.emit('teacher:removeStudent', { pollId, studentId: id })
	}

	return (
		<div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
			<h2>Teacher Console</h2>
			{!createdPoll ? (
				<button onClick={handleCreatePoll}>Create Poll</button>
			) : (
				<div style={{ marginTop: 16 }}>
					<div>Poll ID: <b>{pollId}</b></div>
					<div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
						<div style={{ flex: 1 }}>
							<label>Question</label>
							<textarea value={questionText} onChange={e => setQuestionText(e.target.value)} rows={3} style={{ width: '100%' }} />
						</div>
						<div style={{ flex: 1 }}>
							<label>Options (one per line)</label>
							<textarea value={optionsText} onChange={e => setOptionsText(e.target.value)} rows={3} style={{ width: '100%' }} />
						</div>
					</div>
					<div style={{ marginTop: 8 }}>
						<label>Time Limit (seconds): </label>
						<input type="number" min={5} value={timeLimit} onChange={e => setTimeLimit(e.target.value)} />
					</div>
					<button style={{ marginTop: 12 }} onClick={handleAsk}>Ask Question</button>
					<div style={{ marginTop: 16 }}>
						<h3>Timer: {Math.max(0, Math.ceil(timerMs / 1000))}s</h3>
						<h3>Live Results</h3>
						<ul>
							{Object.entries(results).map(([opt, count]) => (
								<li key={opt}>{opt}: {count}</li>
							))}
						</ul>
						<h3>Students</h3>
						<ul>
							{students.map(s => (
								<li key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
									<span>{s.name}</span>
									<button onClick={() => removeStudent(s.id)}>Remove</button>
								</li>
							))}
						</ul>
					</div>
				</div>
			)}
		</div>
	)
}