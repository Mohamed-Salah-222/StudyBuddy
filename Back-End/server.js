//*--Load Env Variables
require("dotenv").config();
require("./config/passport-setup");
//*--Importing
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Agenda = require("agenda");
const webPush = require("web-push");

//*-- Models
const User = require("./models/user");
const Task = require("./models/task");
const authMiddleware = require("./middleware/authMiddleware");
const { sendVerificationEmail, sendPasswordResetEmail } = require("./services/emailServices");
const passport = require("passport");
const Resources = require("./models/Resources");
const StudyPlan = require("./models/studyPlan");
const Reminder = require("./models/reminder");
const JobManager = require("./jobs/jobManager");
const Discussion = require("./models/discussion");
const Comment = require("./models/comment");

//*--App + Port + dbURI
const app = express();
const port = process.env.PORT || 3000;
const dbURI = process.env.MONGODB_URI;
const agenda = new Agenda({ db: { address: dbURI } });

const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT;

webPush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);

//*--Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());
console.log("HF API Key:", process.env.HUGGINGFACE_API_KEY ? "LOADED" : "NOT LOADED");
console.log("First 10 characters:", process.env.HUGGINGFACE_API_KEY?.substring(0, 10));
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
    if (!user.isVerified) {
      return res.status(401).json({ message: "Please verify your email before logging in" });
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
//*--------------------------------------------------------------------------Add a Study Plan-----------------------------------------------------------------------------
app.post("/api/studyplan", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, startDate, endDate, daysOfWeek } = req.body;
    const validationErrors = [];

    if (!title) {
      validationErrors.push("Title is required.");
    }
    if (!startDate) {
      validationErrors.push("Start Date is required.");
    }
    if (!endDate) {
      validationErrors.push("End Date is required.");
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      validationErrors.push("Start date cannot be after end date.");
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Validation error",
        errors: validationErrors,
      });
    }

    const newStudyPlan = new StudyPlan({
      title,
      description,
      startDate,
      endDate,
      daysOfWeek,
      user: userId,
    });

    const savedPlan = await newStudyPlan.save();
    res.status(201).json(savedPlan);
  } catch (error) {
    console.error("Server error while creating a StudyPlan:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors: messages });
    }

    res.status(500).json({ message: "Server error while creating a StudyPlan", error: error.message });
  }
});
//*--------------------------------------------------------------------------Add a Reminder-------------------------------------------------------------------------------
app.post("/api/reminder", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, dueDateTime, type, notified } = req.body;
    const validationErrors = [];
    if (!title) {
      validationErrors.push("title is required");
    }
    if (!dueDateTime) {
      validationErrors.push("dueDateTime is required");
    }
    if (!type) {
      validationErrors.push("type is required");
    }
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: "Validation error", errors: validationErrors });
    }

    const newReminder = new Reminder({
      title,
      dueDateTime,
      type,
      user: userId,
      notified: notified || false,
    });

    const savedReminder = await newReminder.save();

    const now = new Date();
    if (new Date(dueDateTime) > now && jobManager) {
      try {
        await jobManager.scheduleReminder(savedReminder._id, new Date(dueDateTime));
        console.log(`📅 Scheduled job for reminder: ${savedReminder.title}`);
      } catch (error) {
        console.error("⚠️ Error scheduling reminder job:", error);
      }
    }

    res.status(201).json(savedReminder);
  } catch (error) {
    console.error("Server error while creating a Reminder:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors: messages });
    }

    res.status(500).json({ message: "Server error while creating a Reminder", error: error.message });
  }
});
//*----------------------------------------------------------------------------Add a Discussion-------------------------------------------------------------------------------
app.post("/api/discussion", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, context, tags } = req.body;
    const validationError = [];
    if (!title) {
      validationError.push("Title is Required");
    }
    if (!context) {
      validationError.push("context is Required");
    }
    if (!tags) {
      validationError.push("tags are Required");
    }
    if (validationError.length > 0) {
      return res.status(400).json({ message: "Validation Error", error: validationError });
    }

    const discussion = new Discussion({
      title,
      context,
      tags,
      startedBy: userId,
    });

    const savedDiscussion = await discussion.save();
    res.status(201).json(savedDiscussion);
  } catch (error) {
    console.error("Server error while creating a Discussion:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors: messages });
    }

    res.status(500).json({ message: "Server error while creating a Discussion", error: error.message });
  }
});
//*----------------------------------------------------------------------------Add a Comment----------------------------------------------------------------------------------
app.post("/api/discussions/:discussionId/comments", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const discussionId = req.params.discussionId;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(discussionId)) {
      return res.status(400).json({ message: "Invalid discussion ID format." });
    }

    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ message: "Comment content cannot be empty." });
    }

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found." });
    }

    const newComment = new Comment({
      content: content.trim(),
      postedBy: userId,
      forumPost: discussionId,
    });

    const savedComment = await newComment.save();

    discussion.comments.push(savedComment._id);
    await discussion.save();

    const populatedComment = await Comment.findById(savedComment._id).populate("postedBy", "username");

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error("Server error while creating a Comment:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors: messages });
    }

    res.status(500).json({ message: "Server error while creating a Comment.", error: error.message });
  }
});
//*-------------------------------------------------------------------------Save Push Subscription API------------------------------------------------------------------------
app.post("/api/subscribe", authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const subscription = req.body;

  try {
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ message: "Invalid subscription object provided." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.pushSubscription = subscription;
    await user.save();

    res.status(201).json({ message: "Subscription saved successfully." });
  } catch (error) {
    console.error("Error saving push subscription:", error);
    res.status(500).json({ message: "Failed to save push subscription." });
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
//*---------------------------------------------------------------------------Get Resources------------------------------------------------------------------------------
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
//*--------------------------------------------------------------------------Get a Study Plan-----------------------------------------------------------------------------
app.get("/api/studyplan", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const studyPlans = await StudyPlan.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(studyPlans);
  } catch (error) {
    console.log("Error Fetching study plans", error);
    res.status(500).json({ message: "Server error while fetching studyplans" });
  }
});
//*--------------------------------------------------------------------------Get a reminder------------------------------------------------------------------------------
app.get("/api/reminder", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const reminder = await Reminder.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(reminder);
  } catch (error) {
    console.log("Error Fetching reminder", error);
    res.status(500).json({ message: "Server error while fetching reminder" });
  }
});
//?---------
app.get("/api/reminder/jobs/stats", authMiddleware, async (req, res) => {
  try {
    if (!jobManager) {
      return res.status(503).json({
        success: false,
        message: "Job manager not available",
      });
    }

    const stats = await jobManager.getStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("❌ Error getting job stats:", error);
    res.status(500).json({
      success: false,
      message: "Error getting job statistics",
      error: error.message,
    });
  }
});
//*--------------------------------------------------------------------------Get Discussions-----------------------------------------------------------------------------
app.get("/api/discussion", authMiddleware, async (req, res) => {
  try {
    const discussion = await Discussion.find({}).populate("startedBy", "username");
    res.status(200).json(discussion);
  } catch (error) {
    console.log("Server error while fetching discussions");
    res.status(500).json({ message: "Server error while fetching discussions" });
  }
});
//*---------------------------------------------------------------------Get a specific discussion------------------------------------------------------------------------
app.get("/api/discussion/:id", authMiddleware, async (req, res) => {
  try {
    const discussionId = req.params.id;
    const discussion = await Discussion.findById(discussionId);
    res.status(200).json(discussion);
  } catch (error) {
    console.log("Server error while fetching discussion");
    res.status(500).json({ message: "Server error while fetching discussion" });
  }
});
//*---------------------------------------------------------------------------get comments-------------------------------------------------------------------------------
app.get("/api/discussions/:discussionId/comments", authMiddleware, async (req, res) => {
  try {
    const discussionId = req.params.discussionId;

    if (!mongoose.Types.ObjectId.isValid(discussionId)) {
      return res.status(400).json({ message: "Invalid discussion ID format." });
    }

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found." });
    }

    const comments = await Comment.find({ forumPost: discussionId }).populate("postedBy", "username").sort({ createdAt: 1 }); // Sort by creation date

    res.status(200).json(comments);
  } catch (error) {
    console.error("Server error while fetching comments for discussion:", error);
    res.status(500).json({ message: "Server error while fetching comments.", error: error.message });
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
    if (completed !== undefined) updateFields.completed = completed;

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
//*------------------------------------------------------------------------Update a Study Plan---------------------------------------------------------------------------
app.patch("/api/studyplan/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const planId = req.params.id;
    const { title, description, startDate, endDate, daysOfWeek } = req.body;

    const planToUpdate = await StudyPlan.findById(planId);
    if (!planToUpdate) {
      return res.status(404).json({ message: "Error plan not found" });
    }

    if (userId !== planToUpdate.user.toString()) {
      return res.status(403).json({ message: "Forbidden: You are not authorized to update this task." });
    }

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (startDate !== undefined) updateFields.startDate = startDate;
    if (endDate !== undefined) updateFields.endDate = endDate;
    if (daysOfWeek !== undefined) updateFields.daysOfWeek = daysOfWeek;

    const updatedPlan = await StudyPlan.findByIdAndUpdate(planId, updateFields, { new: true, runValidators: true });
    if (!updatedPlan) {
      return res.status(404).json({ message: "Plan not found after update attempt." });
    }

    res.status(200).json(updatedPlan);
  } catch (error) {
    console.error("Error Updating plan:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors: messages });
    }

    res.status(500).json({ message: "Server error while updating plan." });
  }
});
//*-------------------------------------------------------------------------Update a reminder----------------------------------------------------------------------------
app.patch("/api/reminder/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const reminderId = req.params.id;
    const { title, type, dueDateTime } = req.body;

    const reminderToUpdate = await Reminder.findById(reminderId);
    if (!reminderToUpdate) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    if (userId !== reminderToUpdate.user.toString()) {
      return res.status(403).json({ message: "Forbidden: You are not authorized to update this reminder." });
    }

    const oldDueDateTime = reminderToUpdate.dueDateTime;

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (dueDateTime !== undefined) updateFields.dueDateTime = dueDateTime;
    if (type !== undefined) updateFields.type = type;

    const updatedReminder = await Reminder.findByIdAndUpdate(reminderId, updateFields, { new: true, runValidators: true });
    if (!updatedReminder) {
      return res.status(404).json({ message: "Reminder not found after update attempt." });
    }

    if (dueDateTime && new Date(dueDateTime).getTime() !== oldDueDateTime.getTime() && jobManager) {
      try {
        await jobManager.cancelReminder(updatedReminder._id);

        const now = new Date();
        if (new Date(dueDateTime) > now && !updatedReminder.notified) {
          await jobManager.scheduleReminder(updatedReminder._id, new Date(dueDateTime));
          console.log(`📅 Rescheduled job for reminder: ${updatedReminder.title}`);
        }
      } catch (error) {
        console.error("⚠️ Error rescheduling reminder job:", error);
      }
    }

    res.status(200).json(updatedReminder);
  } catch (error) {
    console.error("Error Updating Reminder:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors: messages });
    }

    res.status(500).json({ message: "Server error while updating Reminder." });
  }
});
//*---------------------------------------------------------------------Update a discussion status-----------------------------------------------------------------------
app.patch("/api/discussion/:id/toggle-status", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const discussionId = req.params.id;
    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found." });
    }

    if (discussion.startedBy.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized: You are not the creator of this discussion." });
    }
    if (discussion.status === "Open") {
      discussion.status = "Closed";
    } else if (discussion.status === "Closed") {
      discussion.status = "Open";
    } else {
      return res.status(400).json({ message: "Invalid discussion status for toggling." });
    }

    const updatedDiscussion = await discussion.save();
    res.status(200).json(updatedDiscussion);
  } catch (error) {
    console.error("Server error while updating the status:", error);
    res.status(500).json({ message: "Server error while updating the status." });
  }
});
//*--------------------------------------------------------------------------Update a comment-----------------------------------------------------------------------------
app.patch("/api/comments/:commentId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const commentId = req.params.commentId;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID format." });
    }

    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ message: "Comment content cannot be empty." });
    }

    const commentToUpdate = await Comment.findById(commentId);

    if (!commentToUpdate) {
      return res.status(404).json({ message: "Comment not found." });
    }

    if (commentToUpdate.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized: You are not the owner of this comment." });
    }

    commentToUpdate.content = content.trim();
    const updatedComment = await commentToUpdate.save();

    const populatedComment = await Comment.findById(updatedComment._id).populate("postedBy", "username");

    res.status(200).json(populatedComment);
  } catch (error) {
    console.error("Server error while updating comment:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors: messages });
    }

    res.status(500).json({ message: "Server error while updating comment.", error: error.message });
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

    await Task.findByIdAndDelete(taskId);

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
    await Resources.findByIdAndDelete(resourceId);
    res.status(200).json({ message: "Resource deleted successfully." });
  } catch (error) {
    console.error("Error deleting Resource:", error);
    res.status(500).json({ message: "Server error while deleting Resource." });
  }
});
//*------------------------------------------------------------------------Delete a Study Plan---------------------------------------------------------------------------
app.delete("/api/studyplan/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const planId = req.params.id;

    const planToDelete = await StudyPlan.findById(planId);
    if (!planToDelete) {
      return res.status(404).json({ message: "Plan not found" });
    }

    if (userId !== planToDelete.user.toString()) {
      return res.status(403).json({ message: "Forbidden: You are not authorized to delete this Plan." });
    }
    await StudyPlan.findByIdAndDelete(planId);
    res.status(200).json({ message: "Plan deleted successfully." });
  } catch (error) {
    console.error("Error deleting PLan:", error);
    res.status(500).json({ message: "Server error while deleting PLan." });
  }
});
//*---------------------------------------------------------------------------Delete a reminder--------------------------------------------------------------------------
app.delete("/api/reminder/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const reminderId = req.params.id;

    const reminderToDelete = await Reminder.findById(reminderId);
    if (!reminderToDelete) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    if (userId !== reminderToDelete.user.toString()) {
      return res.status(403).json({ message: "Forbidden: You are not authorized to delete this reminder." });
    }

    if (jobManager) {
      try {
        await jobManager.cancelReminder(reminderToDelete._id);
        console.log(`🗑️ Cancelled jobs for deleted reminder: ${reminderToDelete.title}`);
      } catch (error) {
        console.error("⚠️ Error cancelling reminder jobs:", error);
      }
    }

    await Reminder.findByIdAndDelete(reminderId);

    res.status(200).json({ message: "Reminder deleted successfully." });
  } catch (error) {
    console.error("Error deleting Reminder:", error);
    res.status(500).json({ message: "Server error while deleting Reminder." });
  }
});
//*--------------------------------------------------------------------------Delete a discussion-------------------------------------------------------------------------
app.delete("/api/discussion/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const discussionId = req.params.id;
    const discussionToDelete = await Discussion.findById(discussionId);

    if (!discussionToDelete) {
      return res.status(404).json({ message: "Discussion not found." });
    }
    if (discussionToDelete.startedBy.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized: You are not the creator of this discussion." });
    }

    await Discussion.findByIdAndDelete(discussionId);

    res.status(204).send();
  } catch (error) {
    console.error("Server error while deleting discussion:", error);
    res.status(500).json({ message: "Server error while deleting discussion." });
  }
});
//*---------------------------------------------------------------------------Delete a comment---------------------------------------------------------------------------
app.delete("/api/comments/:commentId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const commentId = req.params.commentId;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID format." });
    }

    const commentToDelete = await Comment.findById(commentId);
    if (!commentToDelete) {
      return res.status(404).json({ message: "Comment not found." });
    }

    const discussion = await Discussion.findById(commentToDelete.forumPost);
    if (!discussion) {
      return res.status(404).json({ message: "Associated discussion not found." });
    }

    const isCommentOwner = commentToDelete.postedBy.toString() === userId.toString();
    const isDiscussionCreator = discussion.startedBy.toString() === userId.toString();

    if (!isCommentOwner && !isDiscussionCreator) {
      return res.status(403).json({ message: "Unauthorized: You do not have permission to delete this comment." });
    }

    await Comment.findByIdAndDelete(commentId);

    discussion.comments = discussion.comments.filter((commentRef) => commentRef.toString() !== commentId.toString());
    await discussion.save();

    res.status(204).send();
  } catch (error) {
    console.error("Server error while deleting comment:", error);
    res.status(500).json({ message: "Server error while deleting comment.", error: error.message });
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

  res.redirect(`https://study-buddy-blush.vercel.app/auth/google/callback?token=${token}`);
});
//*---------------------------------------------------------------------------------AI-------------------------------------------------------------------------------
(async () => {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  app.post("/api/chat-gemini", async (req, res) => {
    console.log("🚀 CHAT ROUTE HIT!");
    console.log("Request body:", req.body);

    try {
      const { message, conversationHistory = [] } = req.body;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const chat = model.startChat({
        history: conversationHistory.map((item) => ({
          role: item.role,
          parts: [{ text: item.text }],
        })),
      });

      const result = await chat.sendMessage(message);
      const aiResponse = result.response.text();

      console.log("🤖 AI Response:", aiResponse);
      res.json({ response: aiResponse });
    } catch (error) {
      console.error("❌ Error:", error);
      res.status(500).json({
        response: "Sorry, I couldn't process your request right now.",
        details: error.message,
      });
    }
  });
})();
//*---------------------------------------------------------------------------------Agenda-------------------------------------------------------------------------------

mongoose
  .connect(dbURI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    try {
      jobManager = new JobManager();
      await jobManager.start();
      console.log("✅ Background job system initialized");
    } catch (error) {
      console.error("❌ Failed to initialize job manager:", error);
      process.exit(1);
    }

    app.listen(port, () => {
      console.log(`🚀 Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ DATABASE CONNECTION FAILED:", err);
    process.exit(1);
  });

async function gracefulShutdown() {
  console.log("🛑 Shutting down gracefully...");

  if (jobManager) {
    console.log("Stopping Job Manager...");
    await jobManager.stop();
    console.log("Job Manager stopped.");
  }

  console.log("Closing MongoDB connection...");
  await mongoose.disconnect();
  console.log("MongoDB connection closed. Exiting process.");
  process.exit(0);
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
