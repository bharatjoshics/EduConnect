import Tesseract from "tesseract.js";

export const extractPageNumber = async (imageUrl) => {
  try {
    const { data: { text } } = await Tesseract.recognize(
      imageUrl,
      "eng",
      {
        tessedit_pageseg_mode: 6,
        logger: m => console.log(m) // optional progress log
      },
    );

    // Extract first number from text
    const match = text.match(/\d+/);

    if (match) {
      return parseInt(match[0]);
    }

    return null;

  } catch (err) {
    console.log("OCR Error:", err.message);
    return null;
  }
};

export const extractTextFromImage = async (imageUrl) => {
  try {
    const { data: { text } } = await Tesseract.recognize(
      imageUrl,
      "eng"
    );

    return text;

  } catch (err) {
    console.log("OCR Error:", err.message);
    return "";
  }
};

export const cleanOCRText = (text) => {
  return text
    .replace(/[^\x00-\x7F]/g, "")   // remove weird chars
    .replace(/\s+/g, " ")           // normalize spaces
    .replace(/\n\s*\n/g, "\n")      // remove empty lines
    .trim();
};