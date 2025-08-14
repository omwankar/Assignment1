import { useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function Student() {
	const [name, setName] = useState(sessionStorage.getItem('student_name') || '')
	const [studentId, setStudentId] = useState(sessionStorage.getItem('student_id') || '')
	const [pollId, setPollId] = useState(sessionStorage.getItem('poll_id') || '')
	const [currentQuestion, setCurrentQuestion] = useState(null)
	const [selected, setSelected] = useState('')
	const [results, setResults] = useState({})
	const [remaining, setRemaining] = useState(0)
	const [removed, setRemoved] = useState(false)
	const [hasSubmitted, setHasSubmitted] = useState(false)
	const socketRef = useRef(null)

	const socket = useMemo(() => {
		if (!socketRef.current) socketRef.current = io(API_BASE, { transports: ['websocket'] })
		return socketRef.current
	}, [])

	useEffect(() => {
		return () => socket?.disconnect()
	}, [socket])

	const join = () => {
		if (!name || !pollId) return
		sessionStorage.setItem('student_name', name)
		sessionStorage.setItem('poll_id', pollId)
		socket.emit('student:join', { pollId, name })
	}

	useEffect(() => {
		if (!socket) return
		socket.on('student:registered', ({ studentId }) => {
			setStudentId(studentId)
			sessionStorage.setItem('student_id', studentId)
		})
		socket.on('question:asked', (q) => { setCurrentQuestion(q); setSelected(''); setResults({}); setHasSubmitted(false) })
		socket.on('results:update', (r) => setResults(r))
		socket.on('question:ended', ({ results: r }) => { setResults(r); setCurrentQuestion(null); setRemaining(0) })
		socket.on('question:timer', ({ remainingMs }) => setRemaining(Math.max(0, Math.ceil(remainingMs / 1000))))
		socket.on('removedFromPoll', () => {
			setRemoved(true)
			sessionStorage.removeItem('student_id')
		})
		return () => {
			socket.off('student:registered')
			socket.off('question:asked')
			socket.off('results:update')
			socket.off('question:ended')
			socket.off('question:timer')
			socket.off('removedFromPoll')
		}
	}, [socket])

	const submit = () => {
		if (!pollId || !studentId || !selected) return
		setHasSubmitted(true)
		socket.emit('student:answer', { pollId, studentId, option: selected })
	}

	const showResults = hasSubmitted || !currentQuestion

	return (
		<div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
			<h2>Student</h2>
			{removed && <div style={{ color: 'crimson' }}>You were removed from this poll by the teacher.</div>}
			{!studentId && (
				<div style={{ display: 'grid', gap: 8 }}>
					<input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
					<input placeholder="Poll ID" value={pollId} onChange={e => setPollId(e.target.value)} />
					<button onClick={join}>Join</button>
				</div>
			)}

			{currentQuestion && (
				<div style={{ marginTop: 16 }}>
					<h3>{currentQuestion.questionText}</h3>
					<div>Time left: {remaining}s</div>
					<div>
						{currentQuestion.options.map(opt => (
							<label key={opt} style={{ display: 'block' }}>
								<input type="radio" name="opt" value={opt} checked={selected === opt} onChange={() => setSelected(opt)} /> {opt}
							</label>
						))}
					</div>
					<button style={{ marginTop: 8 }} onClick={submit} disabled={hasSubmitted}>Submit</button>
				</div>
			)}

			{showResults && !!Object.keys(results).length && (
				<div style={{ marginTop: 16 }}>
					<h3>Results</h3>
					<ul>
						{Object.entries(results).map(([opt, count]) => (
							<li key={opt}>{opt}: {count}</li>
						))}
					</ul>
				</div>
			)}
		</div>
	)
}