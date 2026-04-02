import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [dbStatus, setDbStatus] = useState({ loading: true, data: null, error: null })
  const [users, setUsers] = useState({ loading: true, data: [], error: null })

  const API_URL = 'http://localhost:3000/api'

  useEffect(() => {
    // Fetch Status
    fetch(`${API_URL}/status`)
      .then((res) => res.json())
      .then((data) => setDbStatus({ loading: false, data, error: null }))
      .catch((err) => setDbStatus({ loading: false, data: null, error: err.message }))

    // Fetch Users
    fetch(`${API_URL}/users`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch users')
        return res.json()
      })
      .then((data) => setUsers({ loading: false, data, error: null }))
      .catch((err) => setUsers({ loading: false, data: [], error: err.message }))
  }, [])

  return (
    <div className="container">
      <header>
        <h1>Database Monitor</h1>
        <p>Real-time PostgreSQL connection status.</p>
      </header>

      <section className="card status-card">
        <h2>Connection Status</h2>
        <div className="status-display">
          {dbStatus.loading ? (
            <span className="loading">Checking connection...</span>
          ) : dbStatus.error ? (
            <span className="error">Server is offline. Make sure your backend node server is running.</span>
          ) : dbStatus.data?.status === 'Database is connected!' ? (
            <p><span className="success">Connected!</span> (Time: {new Date(dbStatus.data.time).toLocaleString()})</p>
          ) : (
            <span className="error">Not Connected.</span>
          )}
        </div>
      </section>

      <section className="card data-card">
        <h2>Users Data</h2>
        <ul className="users-list">
          {users.loading ? (
            <li className="loading">Loading users...</li>
          ) : users.error ? (
            <li><span className="error">Unable to fetch data. Is PostgreSQL running and seeded?</span></li>
          ) : users.data.length === 0 ? (
            <li>No users found.</li>
          ) : (
            users.data.map(user => (
              <li key={user.id}>
                <strong>{user.name}</strong> ({user.email})
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  )
}

export default App
