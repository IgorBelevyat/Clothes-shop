import React, { useState, useEffect } from 'react';
import './UsersTable.css';
import FilterComponent from './FilterComponent';

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [tempUser, setTempUser] = useState({});
  

  const [activeFilters, setActiveFilters] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  });
  
  useEffect(() => {
    fetchUsers();
  }, []);
  

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...users];
      

      if (activeFilters.firstName) {
        filtered = filtered.filter(user => 
          user.firstName.toLowerCase().includes(activeFilters.firstName.toLowerCase())
        );
      }
      

      if (activeFilters.lastName) {
        filtered = filtered.filter(user => 
          user.lastName.toLowerCase().includes(activeFilters.lastName.toLowerCase())
        );
      }
      

      if (activeFilters.email) {
        filtered = filtered.filter(user => 
          user.email.toLowerCase().includes(activeFilters.email.toLowerCase())
        );
      }
      

      if (activeFilters.role) {
        filtered = filtered.filter(user => 
          user.role === activeFilters.role
        );
      }
      
      setFilteredUsers(filtered);
    };

    applyFilters();
  }, [users, activeFilters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/users', {
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await res.json();
      setUsers(data);
      setFilteredUsers(data); 
    } catch (err) {
      console.error("Error fetching users:", err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };
  

  const resetFilters = () => {
    setActiveFilters({
      firstName: '',
      lastName: '',
      email: '',
      role: ''
    });
    setFilteredUsers(users);
  };

  const startEditing = (user) => {
    setEditingUser(user.id);
    setTempUser({ ...user });
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setTempUser({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveUser = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/users/${tempUser.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempUser)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update user');
      }
      

      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === tempUser.id ? { ...tempUser } : u
        )
      );
      
      cancelEditing();
    } catch (err) {
      console.error("Error updating user:", err);
      alert(err.message || 'Failed to update user');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:3001/api/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
      

      setUsers(users.filter(u => u.id !== userId));
      
    } catch (err) {
      console.error("Error deleting user:", err);
      alert(err.message || 'Failed to delete user');
    }
  };

  return (
    <div className="users-table-container">
      <h3>Manage Users</h3>
      
      <div className="filters-section">
        <h4>Filters</h4>
        <FilterComponent 
          filters={{ 
            firstName: { type: 'text', label: 'First Name' },
            lastName: { type: 'text', label: 'Last Name' },
            email: { type: 'text', label: 'Email' },
            role: { 
              type: 'select', 
              label: 'Role',
              options: [
                { value: '', label: 'All roles' },
                { value: 'user', label: 'User' },
                { value: 'admin', label: 'Admin' },
                { value: 'content-manager', label: 'Content Manager' }
              ]
            }
          }}
          values={activeFilters}
          onFilterChange={handleFilterChange}
        />
        <button 
          className="reset-filters-btn" 
          onClick={resetFilters}
        >
          Clean filters
        </button>
        {filteredUsers.length > 0 && users.length !== filteredUsers.length && (
          <div className="filter-status">
            Showing {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} out of {users.length}
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="loading">Loading users...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-users">
                  {users.length === 0 ? 'No users found' : 'No users matching the filters'}
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className={editingUser === user.id ? 'editing' : ''}>
                  <td>{user.id}</td>
                  <td>
                    {editingUser === user.id ? (
                      <input 
                        type="text" 
                        name="firstName" 
                        value={tempUser.firstName} 
                        onChange={handleChange} 
                        className="edit-input"
                      />
                    ) : (
                      user.firstName
                    )}
                  </td>
                  <td>
                    {editingUser === user.id ? (
                      <input 
                        type="text" 
                        name="lastName" 
                        value={tempUser.lastName} 
                        onChange={handleChange} 
                        className="edit-input"
                      />
                    ) : (
                      user.lastName
                    )}
                  </td>
                  <td>
                    {editingUser === user.id ? (
                      <input 
                        type="email" 
                        name="email" 
                        value={tempUser.email} 
                        onChange={handleChange} 
                        className="edit-input"
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td>
                    {editingUser === user.id ? (
                      <select 
                        name="role" 
                        value={tempUser.role} 
                        onChange={handleChange} 
                        className="edit-select"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="content-manager">Content Manager</option>
                      </select>
                    ) : (
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="actions-cell">
                    {editingUser === user.id ? (
                      <>
                        <button 
                          onClick={saveUser} 
                          className="save-btn"
                          title="Save changes"
                        >
                          💾
                        </button>
                        <button 
                          onClick={cancelEditing} 
                          className="cancel-btn"
                          title="Cancel"
                        >
                          ❌
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => startEditing(user)} 
                          className="edit-btn"
                          title="Edit user"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => deleteUser(user.id)} 
                          className="delete-btn"
                          title="Delete user"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}