import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [dbStatus, setDbStatus] = useState({ loading: true, data: null, error: null })
  const [users, setUsers] = useState({ loading: true, data: [], error: null })
  
  // Form State
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [editingUserId, setEditingUserId] = useState(null)
  const [formError, setFormError] = useState(null)

  const API_URL = '/api'

  const fetchStatus = () => {
    fetch(`${API_URL}/status`)
      .then((res) => res.json())
      .then((data) => setDbStatus({ loading: false, data, error: null }))
      .catch((err) => setDbStatus({ loading: false, data: null, error: err.message }))
  }

  const fetchUsers = () => {
    fetch(`${API_URL}/users`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch users')
        return res.json()
      })
      .then((data) => setUsers({ loading: false, data, error: null }))
      .catch((err) => setUsers({ loading: false, data: [], error: err.message }))
  }

  useEffect(() => {
    fetchStatus()
    fetchUsers()
  }, [])

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleEditClick = (user) => {
    setEditingUserId(user.id)
    setFormData({ name: user.name, email: user.email })
    setFormError(null)
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingUserId(null)
    setFormData({ name: '', email: '' })
    setFormError(null)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      fetchUsers()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    if (!formData.name || !formData.email) {
      setFormError('Please fill out all fields.')
      return
    }

    try {
      const method = editingUserId ? 'PUT' : 'POST'
      const url = editingUserId ? `${API_URL}/users/${editingUserId}` : `${API_URL}/users`
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Request failed')
      }

      setFormData({ name: '', email: '' })
      setEditingUserId(null)
      fetchUsers()
    } catch (err) {
      setFormError(err.message)
    }
  }

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
              <li key={user.id} className="user-item">
                <div className="user-info">
                  <strong>{user.name}</strong> 
                  <span className="user-email">{user.email}</span>
                </div>
                <div className="user-actions">
                  <button className="btn btn-edit" onClick={() => handleEditClick(user)}>Edit</button>
                  <button className="btn btn-delete" onClick={() => handleDelete(user.id)}>Delete</button>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="card form-card">
        <h2>{editingUserId ? 'Edit User' : 'Add New User'}</h2>
        {formError && <div className="form-error">{formError}</div>}
        <form onSubmit={handleSubmit} className="crud-form">
          <div className="form-group">
            <label>Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              placeholder="e.g. Jane Doe"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              placeholder="jane@example.com"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingUserId ? 'Update User' : 'Create User'}
            </button>
            {editingUserId && (
              <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  )
}

export default App
