import React, { useState } from 'react'
import BackToShopButton from './BackToShopButton'
import { useNavigate } from 'react-router-dom'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {

      const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      if (!loginResponse.ok) {
        const err = await loginResponse.json()
        setError(err.error || 'Login failed')
        setLoading(false)
        return
      }


      const userResponse = await fetch('http://localhost:3001/api/auth/me', {
        credentials: 'include',
      })

      if (!userResponse.ok) {
        setError('Failed to get user data')
        setLoading(false)
        return
      }

      const userData = await userResponse.json()
      console.log('User data:', userData)

      onLogin(userData)
      

      navigate('/cabinet')
    } catch (err) {
      console.error('Login error:', err)
      setError('Server error. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-wrapper">
      <BackToShopButton />
      <div className="register-form">
        <h2>Sign in</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Continue'}
          </button>
        </form>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </div>
    </div>
  )
}