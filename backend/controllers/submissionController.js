import Submission from "../models/Submission.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { extractPageNumber } from "../services/ocrService.js";

export const createSubmission = async (req, res) => {
  try {
    const { taskType, schoolId, pageNumbers, message } = req.body;
    const parsedPages = pageNumbers ? JSON.parse(pageNumbers) : [];

    const uploadedFiles = [];

    if (!req.files || req.files.length === 0)
        return res.status(400).json({msg: "No files uploaded"});

    let school;

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      if (!file.mimetype.startsWith("image/"))
        return res.status(400).json({msg: "Only image files allowed"});
      
      if (file.size > 5*1024*1024)
        return res.status(400).json({msg: "Max file size is 5MB"});
      

      if(req.user.role === "school")
        school = req.user.id;

      if(req.user.role === "staff"){
        if(!schoolId){
          return res.status(400).json({message: "School ID is required"});
        }
        school = schoolId;
      }
    
      const result = await uploadToCloudinary(file.buffer);

      let detectedPage = await extractPageNumber(result.secure_url);

      uploadedFiles.push({
        url: result.secure_url,
        public_id: result.public_id,
        pageNumber: detectedPage || parsedPages[i] || i + 1
      });
    }

    const submission = await Submission.create({
      schoolId: school,
      taskType,
      files: uploadedFiles,
      message,
      uploadedBy: req.user.role.toLowerCase()
    });

    res.json(submission);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      id,
      { status, message },
      { returnDocument: "after" }
    );

    res.json(submission);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};