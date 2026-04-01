import { prepareImageForAI } from "../services/imageService.js";
import { generateHash, isCached } from "../services/cacheService.js";
import { extractTableFromImage } from "../services/aiService.js";
import Submission from "../models/Submission.js";
import { generateExcel } from "../services/excelService.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

export const downloadExcel = async (req, res) => {

  const submission = await Submission.findById(req.params.id);

  if (!submission) {
    return res.status(404).json({ msg: "Submission not found" });
  }

  submission.status = "Working";
  await submission.save();

  // ✅ CACHE CHECK
  const currentHash = generateHash(submission.files);

  if (isCached(submission, currentHash) && submission.excelFile) {
    console.log("⚡ Using cached Excel");
    submission.status = "Done";
    await submission.save();
    return res.redirect(submission.excelFile);
  }

  let dataByImage = [];

  for (const file of submission.files) {

    const optimizedBuffer = await prepareImageForAI(file.url);

    const base64 = Buffer.from(optimizedBuffer).toString("base64");

    const aiData = await extractTableFromImage(base64, req.user?.id);

    const cleanRows = (aiData.rows || []).filter(r =>Object.values(r).some(val => val && val.toString().trim() !== ""));

    dataByImage.push({
      rows: cleanRows,
      meta: aiData.meta || {}
    });
  }

  if (!dataByImage.length)
    return res.status(400).json({msg: "No data extracted"});

  // ✅ SORT
  const getPage = (p) => {
    const match = p?.toString().match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  dataByImage.sort((a, b) => getPage(a.meta?.page) - getPage(b.meta?.page));

  console.log("FINAL DATA 👉", JSON.stringify(dataByImage, null, 2));
  
  const excelBuffer = generateExcel(dataByImage);

  // TODO: upload to cloudinary
  const uploadResult = await uploadToCloudinary(excelBuffer, "excel");
  submission.excelFile = uploadResult.secure_url;
  submission.lastProcessedHash = currentHash;
  submission.status = "Completed";
  submission.aiData = dataByImage;

  await submission.save();

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=response.xlsx"
  );

  console.log("BUFFER TYPE 👉", Buffer.isBuffer(excelBuffer));
console.log("BUFFER SIZE 👉", excelBuffer.length);

  res.end(excelBuffer);
};