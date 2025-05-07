
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserCabinet({ user, orders, onLogout }) {
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="register-wrapper">
        <div className="register-form">
          <h2>Personal Cabinet</h2>
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    onLogout();          
    navigate('/');       
  };

  return (
    <div className="register-wrapper">
      <div className="register-form">
        <h2>Welcome, {user.firstName} {user.lastName} 👋</h2>
        <p><strong>Email:</strong> {user.email}</p>

        <h3 style={{ marginTop: '20px' }}>🛒 Your Cart:</h3>
        {orders.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <ul>
            {orders.map((item) => (
              <li key={item.id}>
                {item.title} — {item.price}$
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={handleLogout}
          style={{
            marginTop: '30px',
            padding: '10px 20px',
            background: 'black',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
