
import React, { useState } from 'react'
import BackToShopButton from './BackToShopButton'

export default function Register() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()

    const registrationData = { firstName, lastName, email, password }

    try {
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Успешная регистрация:', data)
        setSuccessMessage('Registration successful! You can now log in.')
      } else {
        const err = await response.json()
        alert(err.error || 'Something went wrong')
      }
    } catch (err) {
      console.error('Ошибка:', err)
      alert('Server error')
    }
  }

  return (
    <div className="register-wrapper">
      <BackToShopButton />
      <div className="register-form">
        <h2>Registration</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
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
        {successMessage && <p>{successMessage}</p>}
      </div>
    </div>
  )
}
