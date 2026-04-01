import Message from "../models/Message.js";
import User from "../models/User.js";
import { io } from "../server.js";
import mongoose from "mongoose";

export const getMessages = async (req, res) => {
  try {
    const { id: userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name role")
      .populate("receiver", "name role");

    await Message.updateMany(
      {
        sender: userId,
        receiver: req.user._id,
        seen: false
      },
      { seen: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { receiver, text } = req.body;
    const message = await Message.create({
      sender: req.user.id,
      receiver,
      text,
    });

    const populated = await Message.findById(message._id)
                                  .populate("sender", "name role")
                                  .populate("receiver", "name role");

    // Emit to both sender & receiver
    io.to(receiver).emit("receiveMessage", populated);
    io.to(req.user.id).emit("receiveMessage", populated);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET first staff user (for schools)
export const getStaffForSchool = async (req, res) => {
  try {
    const staff = await User.findOne({ role: "staff" }).select("_id name");
    res.json(staff);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET all schools (for staff)
export const getSchools = async (req, res) => {
  try {
    const schools = await User.find({ role: "school" }).select("_id name");
    res.json(schools);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET unread counts
export const getUnreadCounts = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const counts = await Message.aggregate([
      {
        $match: {
          receiver: userId,
          seen: false,
        },
      },
      {
        $group: {
          _id: "$sender",
          count: { $sum: 1 },
        },
      },
    ]);


    res.json(counts);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};