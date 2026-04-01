import Submission from "../models/Submission.js";

export const getDashboardData = async (req, res) => {
  try {
    let query = {};

    // 🎯 SCHOOL → show RECEIVED from staff
    if (req.user.role === "school") {
      query = {
        schoolId: req.user.id,
        uploadedBy: "staff",
      };
    }

    // 🎯 STAFF → show submissions from schools
    if (req.user.role === "staff") {
      query = {
        uploadedBy: "school",
      };

      if (req.query.schoolId) {
        query.schoolId = req.query.schoolId;
      }

      if (req.query.status) {
        query.status = req.query.status;
      }

      if (req.query.taskType) {
        query.taskType = req.query.taskType;
      }
    }

    const submissions = await Submission.find(query)
      .populate("schoolId", "name email")
      .sort({ createdAt: -1 });

    res.json(submissions);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


export const getMySubmissions = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "school") {
      query = {
        schoolId: req.user.id,
        uploadedBy: "school",
      };
    }

    if (req.user.role === "staff") {
      query = {
        uploadedBy: "staff",
      };

      if (req.query.schoolId) {
        query.schoolId = req.query.schoolId;
      }
    }

    const submissions = await Submission.find(query)
      .populate("schoolId", "name email") // ✅ ADD THIS
      .sort({ createdAt: -1 });

    res.json(submissions);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


export const getAllSubmissions = async (req, res) => {
  try {
    const { status, schoolId, taskType } = req.query;

    let filter = {};

    if (status) filter.status = status;

    if (schoolId) filter.schoolId = schoolId;

    if (taskType) filter.taskType = taskType;

    const submissions = await Submission.find(filter)
      .populate("schoolId", "name email")
      .sort({ createdAt: -1 });

    res.json(submissions);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getReceivedFiles = async (req, res) => {
  try {
    const user = req.user;
    const { schoolId } = req.query;

    let query = {};

    // 🎯 SCHOOL LOGIN
    if (user.role === "school") {
      query = {
        schoolId: user.id,
        uploadedBy: "staff", // ✅ only show staff uploads
      };
    }

    // 🎯 STAFF LOGIN
    if (user.role === "staff") {
      query = {
        uploadedBy: "school", // ✅ only show school uploads
      };

      // optional filter
      if (schoolId) {
        query.schoolId = schoolId;
      }
    }

    const submissions = await Submission.find(query)
      .populate("schoolId", "name email");

    res.status(200).json(submissions);

  } catch (error) {
    console.error("❌ Error in getReceivedFiles:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateSubmissionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const updated = await Submission.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getTaskTypes = async (req, res) => {
  try {
    const types = await Submission.distinct("taskType");
    res.json(types);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};