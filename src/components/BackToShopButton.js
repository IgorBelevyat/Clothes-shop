import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaAngleLeft } from 'react-icons/fa'


export default function BackToShopButton() {
  const navigate = useNavigate()

  return (
    <button onClick={() => navigate('/')} className="back-button">
      <FaAngleLeft className="back-icon" />
    </button>
  )
}
