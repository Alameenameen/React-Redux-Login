// backend/app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); // your DB connector
const path = require("path");
const cookieParser = require("cookie-parser");
const authRoutes = require('./Routes/AuthRoutes');
const userRoute = require('./Routes/userRoutes')



// controllers & middleware
const AuthController = require("./controllers/AuthController"); // contains Signup
const upload = require("./Utils/multer")

const app = express();

// Allow your frontend origin and send cookies
const allowedOrigins = ["http://localhost:5173"]; // add other origins if needed
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // <- allow cookies to be sent/received
  })
);

// middlewares
app.use(express.json());
app.use(cookieParser());


// Serve uploaded files (profile images) publicly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// app.post("/auth/signup", upload.single("profilePicture"), AuthController.Signup);
app.use('/auth', authRoutes)
app.use('/user',userRoute)

// connect DB & start server
const PORT = process.env.PORT || 5000;
connectDB(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  });
