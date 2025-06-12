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
    <div className="auth-page">
      <BackToShopButton />
      <div className="auth-container">
        <div className="auth-form-section">
          <h2>Вхід</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Введіть адресу електронної пошти або номер телефону"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Введіть пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="form-links">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Запам'ятати мене</span>
              </label>
              <a href="#" className="forgot-password">Забули пароль?</a>
            </div>
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Завантаження...' : 'Увійти'}
            </button>
          </form>
          {error && <p className="error-message">{error}</p>}
          <div className="auth-footer">
            <span>Вперше на нашому сайті? </span>
            <a href="/register">Зареєструватися</a>
          </div>
        </div>
        
        <div className="auth-social-section">
          <h3>Увійдіть за допомогою</h3>
          <div className="social-buttons">
            <button className="social-btn google-btn" disabled>
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path fill="#4285F4" d="M19.99 10.187c0-.82-.069-1.417-.216-2.037H10.2v3.698h5.62c-.113.955-.725 2.394-2.084 3.365l-.01.066 3.033 2.318.21.02c1.926-1.75 3.04-4.325 3.04-7.43z"/>
                <path fill="#34A853" d="M10.2 19.931c2.753 0 5.064-.886 6.753-2.414l-3.243-2.404c-.874.616-2.057 1.043-3.51 1.043-2.69 0-4.97-1.78-5.781-4.217l-.063.005-3.156 2.404-.041.06c1.677 3.279 5.122 5.523 9.041 5.523z"/>
                <path fill="#FBBC05" d="M4.419 11.939c-.21-.616-.33-1.274-.33-1.939 0-.665.12-1.323.32-1.939l-.006-.068-3.197-2.448-.052.025A9.872 9.872 0 0 0 .001 10c0 1.61.39 3.135 1.153 4.47l3.265-2.531z"/>
                <path fill="#EB4335" d="M10.2 3.853c1.914 0 3.206.815 3.943 1.499l2.897-2.781C15.253.985 12.953 0 10.2 0 6.281 0 2.836 2.244 1.159 5.523l3.243 2.406c.821-2.437 3.101-4.076 5.798-4.076z"/>
              </svg>
              Google
            </button>
            <button className="social-btn telegram-btn" disabled>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="#0088cc">
                <path d="M18.384,2.297a1.018,1.018,0,0,0-.877-.195L1.606,7.652a1.038,1.038,0,0,0-.046,1.934l4.046,1.623,1.623,4.046a1.038,1.038,0,0,0,1.934-.046L14.713,2.609A1.018,1.018,0,0,0,18.384,2.297ZM8.659,11.174,8.3,14.235l-.98-2.441Zm6.261-6.261L8.845,10.988,5.765,9.651Z"/>
              </svg>
              Telegram
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}