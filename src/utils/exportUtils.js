import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

export const exportToPdf = async (elementRef, fileName = "report.pdf") => {
  const input = elementRef.current;
  const canvas = await html2canvas(input, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const imgWidth = 210; 
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  pdf.save(fileName);
};




export const exportToExcel = (elementRef, fileName = "Report.xlsx") => {
  const table = elementRef.current.querySelector("table");
  if (!table) {
    alert("No data available for export!");
    return;
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.table_to_sheet(table);

  // Optional: Set column widths
  worksheet["!cols"] = [
    { wch: 20 },
    { wch: 30 },
    { wch: 20 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
  ];

  // Center-align all cells
  Object.keys(worksheet).forEach((key) => {
    if (key.startsWith("!")) return;
    if (!worksheet[key].s) worksheet[key].s = {};
    worksheet[key].s.alignment = { horizontal: "center", vertical: "center" };
  });

  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  XLSX.writeFile(workbook, fileName);
};
