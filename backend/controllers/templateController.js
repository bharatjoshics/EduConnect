import PDFDocument from "pdfkit";

export const downloadTemplate = (req, res) => {
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=template.pdf");

  doc.pipe(res);

  // Title
  doc
    .fontSize(18)
    .text("BRDServices Student Sheet", { align: "center" });

  doc.moveDown();

  // Header fields
  doc.fontSize(11);
  doc.text("Page Number: ___________");
  doc.text("School Name: ________________________________");
  doc.text("Class: ___________");

  doc.moveDown(2);

  // Table headers
  const startX = 40;
  const startY = doc.y;

  const columns = [
    "Sr No",
    "DOB",
    "Scholar No",
    "Student ID",
    "Student Name",
    "Father Name",
    "Remark"
  ];

  const colWidths = [40, 50, 90, 90, 100, 120, 60];

  let x = startX;

  columns.forEach((col, i) => {
    doc.rect(x, startY, colWidths[i], 25).stroke();
    doc.text(col, x + 5, startY + 7, { width: colWidths[i] - 10 });
    x += colWidths[i];
  });

  // Rows (empty boxes)
  let y = startY + 25;

  for (let row = 0; row < 15; row++) {
    let x = startX;

    colWidths.forEach(width => {
      doc.rect(x, y, width, 30).stroke();
      x += width;
    });

    y += 30;
  }

  doc.end();
};