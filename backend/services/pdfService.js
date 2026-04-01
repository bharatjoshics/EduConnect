import { PDFDocument } from "pdf-lib";

export const generatePDF = async (files) => {
  const pdfDoc = await PDFDocument.create();

  const getPageNumber = (val) => {
    if (!val) return 0;
    const match = val.toString().match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  const sortedFiles = files.sort((a, b) => {
    return getPageNumber(a.page) - getPageNumber(b.page);
  });

  for (const file of sortedFiles) {
    const response = await fetch(file.url);
    const imageBytes = await response.arrayBuffer();

    let image;

    if (file.url.endsWith(".png")) {
      image = await pdfDoc.embedPng(imageBytes);
    } else {
      image = await pdfDoc.embedJpg(imageBytes);
    }

    const page = pdfDoc.addPage([image.width, image.height]);

    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  return await pdfDoc.save();
};