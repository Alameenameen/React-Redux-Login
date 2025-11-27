import React, { useState } from 'react';
import { User, LogOut, Home } from 'lucide-react';
import '../assets/Styles/Home.css'
import {logout} from '../redux/slice/userSlice';
import { useDispatch,useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);



  const user = useSelector((state)=>state.auth?.user) || {};
  const navigate = useNavigate()
  const dispatch = useDispatch()



    const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleProfile = () => {
    alert('Navigate to profile page');
    setShowProfileMenu(false);
  };

  return (
    <div className="home-container">
      {/* Header/Navbar */}
      <header className="navbar">
        <div className="navbar-content">
          {/* Logo/Brand */}
          <div className="brand">
            <Home className="brand-icon" />
            <h1 className="brand-title">User Management</h1>
          </div>

          {/* Profile Dropdown */}
          <div className="profile-section">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="profile-button"
            >
              <div className="avatar">{user.avatar}</div>
              <span className="user-name">{user.name}</span>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <p className="dropdown-name">{user.name}</p>
                  <p className="dropdown-email">{user.email}</p>
                </div>
                
                <button onClick={handleProfile} className="dropdown-item">
                  <User className="dropdown-icon" /> 
                  <span>Profile</span>
                </button>
                
                <div className="dropdown-divider"></div>
                
                <button onClick={handleLogout} className="dropdown-item logout">
                  <LogOut className="dropdown-icon" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="welcome-card">
          <h2 className="welcome-text">Welcome back, {user.name}!</h2>
        </div>
      </main>

    </div>
  );
};

export default HomePage;