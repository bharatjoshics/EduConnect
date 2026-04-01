import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import getSubmissionRoutes from "./routes/getSubmissionRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import excelRoutes from "./routes/excelRoutes.js";
import templateRoute from "./routes/templateRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import rateLimit from "express-rate-limit";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

console.log("CLIENT_URL: ", process.env.CLIENT_URL);
console.log("PORT: ", process.env.PORT);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many requests, try later",
});
app.use("/api/submissions", limiter);

app.use("/api/auth", authRoutes);
app.use("/api/getsubmissions", getSubmissionRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/messages", chatRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/excel", excelRoutes);
app.use("/api", templateRoute);

// test
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "API Running"
  })
});

// HTTP + Socket.io
const httpServer = createServer(app);
export const io = new Server(httpServer, { cors: { 
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST"],
  credentials: true
} });

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("join", (userId) => {
    if (!userId) return;
    socket.join(userId);
    console.log(`${userId} joined`);
  });

  // Typing Indicator
  socket.on("typing", ({ to })=>{
    socket.to(to).emit("typing");
  })

  // Stop Typing
  socket.on("stopTyping", ({ to })=>{
    socket.to(to).emit("stopTyping");
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// DB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log(err));