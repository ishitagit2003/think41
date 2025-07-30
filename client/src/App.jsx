import React, { useEffect, useState } from 'react'
import { api } from './services/api'

export default function App() {
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/api/items')
      setItems(res.data)
    } catch (e) {
      setError('Failed to load items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function addItem(e) {
    e.preventDefault()
    if (!title.trim()) return
    try {
      const res = await api.post('/api/items', { title })
      setItems(prev => [...prev, res.data])
      setTitle('')
    } catch (e) {
      setError('Failed to add item')
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '32px auto', fontFamily: 'system-ui, Arial' }}>
      <h1>Think41 Starter</h1>
      <p>Minimal full-stack: React + Express</p>

      <form onSubmit={addItem} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="New item title"
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit">Add</button>
      </form>

      <button onClick={load} disabled={loading} style={{ marginBottom: 16 }}>
        {loading ? 'Loading…' : 'Reload'}
      </button>

      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

      <ul>
        {items.map(i => (
          <li key={i.id}>{i.title}</li>
        ))}
      </ul>
    </div>
  )
}
