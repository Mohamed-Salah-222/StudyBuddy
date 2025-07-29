//*--Load Env Variables
require("dotenv").config();
require("./config/passport-setup");

//*--Importing
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//*-- Models
const User = require("./models/user");
const Task = require("./models/task");
const authMiddleware = require("./Middleware/authMiddleware");
const { sendVerificationEmail, sendPasswordResetEmail } = require("./services/emailServices");
const passport = require("passport");
const Resources = require("./models/Resources");

//*--App + Port + dbURI
const app = express();
const port = process.env.PORT || 3000;
const dbURI = process.env.MONGODB_URI;

//*--Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

//*-----------------------------------------------------------------------------------APIs-----------------------------------------------------------------------------------
//^------------------------------------------------------------------------------POST REQUESTS-------------------------------------------------------------------------------
//*------------------------------------------------------------------------------Register API--------------------------------------------------------------------------------
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    let user = await User.findOne({ email: email });

    if (user && user.isVerified) {
      return res.status(409).json({ message: "This email is already registered and verified." });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (user && !user.isVerified) {
      user.password = await bcrypt.hash(password, 10);
      user.verificationCode = verificationCode;
      user.verificationCodeExpires = verificationCodeExpires;
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      user = new User({
        email,
        username,
        password: hashedPassword,
        verificationCode,
        verificationCodeExpires,
      });
    }

    await user.save();

    try {
      await sendVerificationEmail(user.email, verificationCode);
    } catch (emailError) {
      console.error(emailError);
      return res.status(500).json({ message: "User registered, but failed to send verification email. Please try verifying later." });
    }

    res.status(201).json({ message: "Registration successful! Please check your email for a verification code." });
  } catch (error) {
    console.error("Error during registration process:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});
//*------------------------------------------------------------------------------Verify API-------------------------------------------------------------------------------
app.post("/api/auth/verify", async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({ message: "Email and verification code are required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found. Please register first." });
    }

    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    if (user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ message: "Verification code has expired. Please register again to get a new code." });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Account verified successfully! You can now log in." });
  } catch (error) {
    console.error("Error during account verification:", error);
    res.status(500).json({ message: "Server error during verification." });
  }
});
//*-------------------------------------------------------------------------Forgot Password API--------------------------------------------------------------------------
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      console.log(`Password reset requested for non-existent user: ${email}`);
      return res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
    }

    const resetSecret = process.env.JWT_SECRET + user.password;
    const payload = { email: user.email, id: user._id };

    const token = jwt.sign(payload, resetSecret, { expiresIn: "15m" });

    await sendPasswordResetEmail(user.email, user._id, token);

    res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
  } catch (error) {
    console.error("Error in forgot password process:", error);

    res.status(500).json({ message: "An error occurred. Please try again later." });
  }
});
//*-------------------------------------------------------------------------Reset Password API--------------------------------------------------------------------------
app.post("/api/auth/reset-password/:userId/:token", async (req, res) => {
  try {
    const { userId, token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const resetSecret = process.env.JWT_SECRET + user.password;

    jwt.verify(token, resetSecret);

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(400).json({ message: "Invalid or expired password reset link." });
  }
});
//*------------------------------------------------------------------------------Login API-------------------------------------------------------------------------------
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email or password are missing" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const payload = { userId: user._id, email: user.email, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({ message: "Logged in successfully!", token });
  } catch (err) {
    res.status(500).json({ message: "Server error during login." });
  }
});
//*------------------------------------------------------------------------------Add a Task-------------------------------------------------------------------------------
app.post("/api/tasks", authMiddleware, async (req, res) => {
  try {
    const { title, dueDate, priority, tags, description } = req.body;
    const userId = req.user.userId;

    const errors = [];
    if (!title) {
      errors.push("Title is required.");
    }

    if (!dueDate) {
      errors.push("Due Date is required.");
    } else if (isNaN(new Date(dueDate).getTime())) {
      errors.push("Due Date is invalid.");
    }
    if (!tags || tags.length === 0) {
      errors.push("Tags are required (at least one tag).");
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation error", errors: errors });
    }

    const newTask = new Task({
      title,
      dueDate,
      priority,
      tags,
      user: userId,
      description,
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error("Server error while creating a task:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors: messages });
    }

    res.status(500).json({ message: "Server error while creating a task" });
  }
});
//*----------------------------------------------------------------------------Add a Resource-----------------------------------------------------------------------------
app.post("/api/resources", authMiddleware, async (req, res) => {
  try {
    const { title, url, description, type, tags } = req.body;
    const userId = req.user.userId;
    const errors = [];
    if (!title) {
      errors.push("Title is Required");
    }
    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation error", errors: errors });
    }
    const newResources = new Resources({
      title,
      url,
      description,
      type,
      tags,
      user: userId,
    });
    const savedResources = await newResources.save();
    res.status(201).json(savedResources);
  } catch (error) {
    console.error("Server error while creating a Resource:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors: messages });
    }

    res.status(500).json({ message: "Server error while creating a Resource" });
  }
});

//^----------------------------------------------------------------------------GET REQUESTS-------------------------------------------------------------------------------
//*------------------------------------------------------------------------------get tasks--------------------------------------------------------------------------------
app.get("/api/tasks", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const tasks = await Task.find({ user: userId }).sort({ updatedAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Server error while fetching tasks." });
  }
});
//*---------------------------------------------------------------------------get Resources------------------------------------------------------------------------------
app.get("/api/resources", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const resources = await Resources.find({ user: userId }).sort({ updatedAt: -1 });

    res.status(200).json(resources);
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({ message: "Server error while fetching resources." });
  }
});
//^---------------------------------------------------------------------------Patch REQUESTS-----------------------------------------------------------------------------
//*---------------------------------------------------------------------------Update a task------------------------------------------------------------------------------
app.patch("/api/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const { title, priority, dueDate, tags, completed } = req.body;
    const taskId = req.params.id;
    const userId = req.user.userId;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    if (userId !== task.user.toString()) {
      return res.status(403).json({ message: "Forbidden: You are not authorized to update this task." });
    }

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (priority !== undefined) updateFields.priority = priority;
    if (dueDate !== undefined) updateFields.dueDate = dueDate;
    if (tags !== undefined) updateFields.tags = tags;
    if (completed !== undefined) updateFields.completed = completed; // Allow updating completed status

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateFields, { new: true, runValidators: true });

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found after update attempt." });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error Updating task:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors: messages });
    }

    res.status(500).json({ message: "Server error while updating task." });
  }
});
//^--------------------------------------------------------------------------Delete REQUESTS-----------------------------------------------------------------------------
//*---------------------------------------------------------------------------Delete a task------------------------------------------------------------------------------
app.delete("/api/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.userId;

    const taskToDelete = await Task.findById(taskId);

    if (!taskToDelete) {
      return res.status(404).json({ message: "Task not found." });
    }

    if (userId !== taskToDelete.user.toString()) {
      return res.status(403).json({ message: "Forbidden: You are not authorized to delete this task." });
    }

    const deletedTask = await Task.findByIdAndDelete(taskId);

    res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Server error while deleting task." });
  }
});
//*---------------------------------------------------------------------------Delete a Resource--------------------------------------------------------------------------
app.delete("/api/resources/:id", authMiddleware, async (req, res) => {
  try {
    const resourceId = req.params.id;
    const userId = req.user.userId;

    const resourceToDelete = await Resources.findById(resourceId);
    if (!resourceToDelete) {
      return res.status(404).json({ message: "Resource not found" });
    }
    if (userId !== resourceToDelete.user.toString()) {
      return res.status(403).json({ message: "Forbidden: You are not authorized to delete this resource." });
    }
    const deletedResource = await Resources.findByIdAndDelete(resourceId);
    res.status(200).json({ message: "Resource deleted successfully." });
  } catch (error) {
    console.error("Error deleting Resource:", error);
    res.status(500).json({ message: "Server error while deleting Resource." });
  }
});
//*---------------------------------------------------------------------------------Google-------------------------------------------------------------------------------

app.get(
  "/api/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

app.get("/api/auth/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/login" }), (req, res) => {
  const payload = {
    userId: req.user._id,
    email: req.user.email,
    username: req.user.username,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.redirect(`http://localhost:5173/auth/google/callback?token=${token}`);
});

//*-- DataBase + Starting the server
mongoose
  .connect(dbURI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(port, () => {
      console.log(`🚀 Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ DATABASE CONNECTION FAILED:", err);
    process.exit(1);
  });
