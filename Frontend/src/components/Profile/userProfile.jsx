import React, { useState, useEffect } from 'react';
import { Camera, Edit2, Save, X, Mail, Phone, User, ArrowLeft } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateUser } from '../../redux/slice/userSlice';
import api from '../../utils/Api';
import '../../assets/Styles/Profile.css';

const ProfilePage = () => {
  const user = useSelector((state) => state.auth?.user) || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userName: user.userName || '',
    email: user.email || '',
    phone: user.phone || ''
  });

  const [profilePicFile, setProfilePicFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user.profilePicture || '');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

const getFullImageUrl = (imagePath) => {
    if (!imagePath) return '';
    // If it's already a full URL or base64, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    // Construct full URL from backend
    const baseURL = import.meta.env.VITE_URL || 'http://localhost:5000';
    return `${baseURL}${imagePath}`;
  };

  // ✅ Initialize preview URL on component mount and when user changes
  useEffect(() => {
    setFormData({
      userName: user.userName || '',
      email: user.email || '',
      phone: user.phone || ''
    });
    
    // Only update preview if we don't have a temporary file preview
    if (!profilePicFile) {
      const fullImageUrl = getFullImageUrl(user.profilePicture);
      setPreviewUrl(fullImageUrl);
      console.log('Setting preview URL:', fullImageUrl);
    }
  }, [user, profilePicFile]);

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({}); 
    setSuccessMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      userName: user.userName || '',
      email: user.email || '',
      phone: user.phone || ''
    });
    setProfilePicFile(null);
   setPreviewUrl(getFullImageUrl(user.profilePicture));
    setErrors({});
    setSuccessMessage('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userName.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.userName.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    const phoneRegex = /^[+]?[\d\s()-]{10,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          profilePic: 'Please select a valid image file'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          profilePic: 'Image size should be less than 5MB'
        }));
        return;
      }

      setProfilePicFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);

      if (errors.profilePic) {
        setErrors(prev => ({
          ...prev,
          profilePic: ''
        }));
      }
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('userName', formData.userName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone || '');

      if (profilePicFile) {
        formDataToSend.append('profilePicture', profilePicFile);
      }

      const response = await api.put('/user/profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        dispatch(updateUser(response.data.user));
         setProfilePicFile(null);
        const newImageUrl = getFullImageUrl(response.data.user.profilePicture);
        setPreviewUrl(newImageUrl);
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
       

        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        <div className="profile-card">
          {/* Header */}
          <div className="profile-header">
            <button onClick={() => navigate('/home')} className="back-button">
              <ArrowLeft size={20} />
              Back to Home
            </button>
          </div>

          <div className="profile-banner"></div>

          {/* Profile Section */}
            <div className="profile-content">
            <div className="profile-pic-wrapper">
              <div className="profile-pic-container">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="profile-pic"
                    onError={(e) => {
                      console.error('Image failed to load:', previewUrl);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                {/* ✅ Fallback placeholder - always rendered but hidden if image exists */}
                <div 
                  className="profile-pic-placeholder"
                  style={{ display: previewUrl ? 'none' : 'flex' }}
                >
                  {getInitials(formData.userName)}
                </div>

                {isEditing && (
                  <label className="profile-pic-edit">
                    <Camera size={20} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePicChange}
                      className="file-input"
                    />
                  </label>
                )}
              </div>

              {errors.profilePic && (
                <p className="error-text">{errors.profilePic}</p>
              )}
            </div>

            {/* Edit/Save Buttons */}
            <div className="profile-actions">
              {!isEditing ? (
                <button onClick={handleEdit} className="btn btn-primary">
                  <Edit2 size={18} />
                  Edit Profile
                </button>
              ) : (
                <div className="btn-group">
                  <button
                    onClick={handleCancel}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    <X size={18} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn btn-success"
                    disabled={loading}
                  >
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="success-message">
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {errors.submit && (
              <div className="error-message">
                {errors.submit}
              </div>
            )}

            {/* Profile Details */}
            <div className="profile-details">
              <h2 className="details-title">Profile Information</h2>

              {/* Name Field */}
              <div className="form-group">
                <label className="form-label">
                  <User size={18} />
                  Full Name
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={handleInputChange}
                      className={`form-input ${errors.userName ? 'input-error' : ''}`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="error-text">{errors.name}</p>
                    )}
                  </div>
                ) : (
                  <p className="form-display">{user.userName || 'Not provided'}</p>
                )}
              </div>



              {/* Email Field */}
              <div className="form-group">
                <label className="form-label">
                  <Mail size={18} />
                  Email Address
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`form-input ${errors.email ? 'input-error' : ''}`}
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p className="error-text">{errors.email}</p>
                    )}
                  </div>
                ) : (
                  <p className="form-display">{user.email || 'Not provided'}</p>
                )}
              </div>



              {/* Phone Field */}
              <div className="form-group">
                <label className="form-label">
                  <Phone size={18} />
                  Phone Number
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`form-input ${errors.phone ? 'input-error' : ''}`}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && (
                      <p className="error-text">{errors.phone}</p>
                    )}
                  </div>
                ) : (
                  <p className="form-display">{user.phone || 'Not provided'}</p>
                )}
              </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;