import { Link } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <div className="App" style={{ padding: 24 }}>
      <h1>Live Polling System</h1>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/teacher">Teacher</Link>
        <Link to="/student">Student</Link>
      </div>
      <p style={{ marginTop: 12 }}>Set VITE_API_BASE in .env for production.</p>
    </div>
  )
}

export default App
