import React, { useState } from 'react'
import BackToShopButton from '../components/BackToShopButton'


export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleRegister = (e) => {
    e.preventDefault()
    console.log('Реєстрація:', { email, password })
  }

  return (
    <div className="register-wrapper">
      <BackToShopButton />
      <div className="register-form">
        <h2>Registration</h2>
        <form onSubmit={handleRegister}>
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
          <button type="submit">Continue</button>
        </form>
      </div>
    </div>
  )
}
