import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Teacher from './pages/Teacher.jsx'
import Student from './pages/Student.jsx'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/teacher', element: <Teacher /> },
  { path: '/student', element: <Student /> },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
