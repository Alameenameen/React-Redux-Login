const User = require("../models/UserSchema")
const fs = require("fs");
const path = require("path");


  // Get user profile
const getProfile = async (req, res) => {
    try {
      const userId = req.user.id; // From auth middleware

      const user = await User.findById(userId).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          userName: user.userName,
          email: user.email,
          phone: user.phone || "",
          profilePicture: user.profilePicture || ""
        }
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  };

  // Update user profile
  const updateProfile =  async (req, res) => {
     try {
      const userId = req.user.id; // ✅ Changed from req.userId to req.user.id
      const { userName, email, phone } = req.body;

      console.log("Update profile request:", { userId, userName, email, phone });

      // Validation
      if (!userName || !email) {
        return res.status(400).json({
          success: false,
          message: "Name and email are required"
        });
      }

      // Name length validation
      if (userName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Name must be at least 2 characters"
        });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format"
        });
      }

      // Find user first
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // ✅ Only check if email exists for OTHER users (not the current user)
      if (email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Email already in use by another account"
          });
        }
      }

      // Delete old profile picture if new one is uploaded
      if (req.file && user.profilePicture) {
        const oldPicPath = path.join(__dirname, "..", user.profilePicture);
        if (fs.existsSync(oldPicPath)) {
          try {
            fs.unlinkSync(oldPicPath);
            console.log("Old profile picture deleted");
          } catch (err) {
            console.error("Error deleting old picture:", err);
          }
        }
      }

      // Update user data
      user.userName = userName.trim();
      user.email = email.toLowerCase().trim();
      user.phone = phone ? phone.trim() : "";

      if (req.file) {
        user.profilePicture = `/uploads/${req.file.filename}`;
      }

      await user.save();

      console.log("Profile updated successfully:", user);

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          phone: user.phone,
          profilePicture: user.profilePicture
        }
      });
    } catch (error) {
      console.error("Update profile error:", error);
      
      // Handle duplicate email error from MongoDB
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another account"
        });
      }

      res.status(500).json({
        success: false,
        message: "Server error: " + error.message
      });
    }
  }

//   // Delete profile picture
  const deleteProfilePicture =  async (req, res) => {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // Delete file from filesystem
      if (user.profilePicture) {
        const picPath = path.join(__dirname, "..", user.profilePicture);
        if (fs.existsSync(picPath)) {
          fs.unlinkSync(picPath);
        }
      }

      user.profilePicture = "";
      await user.save();

      res.status(200).json({
        success: true,
        message: "Profile picture deleted successfully",
        user: {
          id: user._id,
          userName: user.userName,
          email: user.email,
          phone: user.phone,
          profilePicture: ""
        }
      });
    } catch (error) {
      console.error("Delete profile picture error:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }


module.exports = {
    getProfile,
    updateProfile,
    deleteProfilePicture
}