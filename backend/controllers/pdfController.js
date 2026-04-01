import Submission from "../models/Submission.js";
import { generatePDF } from "../services/pdfService.js";

export const downloadPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({ msg: "Submission not found" });
    }

    let filesWithPage = [];

    for (let i=0; i<submission.files.length; i++) {
      const file = submission.files[i]

      filesWithPage.push({
        url: file.url,
        page: file.pageNumber || i + 1
      });
    }

    const pdfBytes = await generatePDF(filesWithPage);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=document.pdf");

    res.send(Buffer.from(pdfBytes));

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};