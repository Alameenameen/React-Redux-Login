import React, { useState } from 'react';
import { User, LogOut, Home } from 'lucide-react';
import '../assets/Styles/Home.css'
import {logout} from '../redux/slice/userSlice';
import { useDispatch,useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../utils/Api'

const HomePage = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);



  const user = useSelector((state)=>state.auth?.user) || {};
  console.log('redux user:', user);

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    const baseURL = import.meta.env.VITE_URL || 'http://localhost:5000';
    return `${baseURL}${imagePath}`;
  }

    const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };


  const profilePicUrl = getFullImageUrl(user.profilePicture);


  const handleLogout = async() => {
    dispatch(logout());
    await api.post("auth/logout")
    navigate('/');
  };

  const handleProfile = () => {
    navigate('/profile')
    setShowProfileMenu(false);
  };

  return (
    <div className="home-container">
      <header className="navbar">
        <div className="navbar-content">
          <div className="brand">
            <Home className="brand-icon" />
            <h1 className="brand-title">User Management</h1>
          </div>

          <div className="profile-section">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="profile-button"
            >
              <div className="avatar">
                {profilePicUrl ? (
                  <img
                    src={profilePicUrl}
                    alt={user.userName}
                    className="avatar-img"
                    onError={(e) => {
                      // If image fails to load, show initials
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: bold; font-size: 1rem;">${getInitials(user.userName)}</div>`;
                    }}
                  />
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}>
                    {getInitials(user.userName)}
                  </div>
                )}
              </div>
            </button>

            {showProfileMenu && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <p className="dropdown-name">{user.userName}</p>
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

      <main className="main-content">
        <div className="welcome-card">
          <h2 className="welcome-text">Welcome back, {user.userName}!</h2>
        </div>
      </main>
    </div>
  );
};

export default HomePage;