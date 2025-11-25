import React, { useState } from 'react';
import { User, LogOut, Home } from 'lucide-react';
import '../assets/Styles/Home.css'

const HomePage = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'JD'
  };

  const handleLogout = () => {
    alert('Logging out...');
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