import XLSX from "xlsx";

export const generateExcel = (dataByImage) => {
  const workbook = XLSX.utils.book_new();

  dataByImage.forEach((item, index) => {
    const { rows, meta } = item;

    // 🧾 Header rows (top section)
    const header = [
      ["BRD Services Student Sheet"],
      [],
      ["Page Number:", meta.page || ""],
      ["School Name:", meta.school || ""],
      ["Class:", meta.class || ""],
      []
    ];

    // 📊 Table data
    const worksheetData = [
      ...header,
      [
        "Sr No",
        "DOB",
        "Scholar No",
        "Student ID",
        "Student Name",
        "Father Name",
        "Remark"
      ],
      ...rows.map(r => [
        r.SrNo || r.sr_no || "",
        r.DOB || r.dob || "",
        r.Scholar_No || r.scholar_no || "",
        r.Student_ID || r.student_id || "",
        r.Student_Name || r.student_name || "",
        r.Father_Name || r.father_name || "",
        r.Remark || r.remark || ""
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `Page-${index + 1}`
    );
  });

  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "buffer"
  });

  return buffer;
};