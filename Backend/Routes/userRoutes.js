const express = require("express");
const userRouter = express.Router();
const UserController = require("../controllers/UserController")
const UserAuth = require("../middleware/userAuth")
const upload = require("../Utils/multer");


// Profile routes (protected)
userRouter.get("/profile", UserAuth.protect, UserController.getProfile);
userRouter.put("/profile", UserAuth.protect, upload.single("profilePicture"), UserController.updateProfile);
userRouter.delete("/profile/picture", UserAuth.protect, UserController.deleteProfilePicture);

module.exports = userRouter;