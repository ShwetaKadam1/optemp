import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Add logo path (public/logo.png)
const logoUrl = "/logo.png";

export const generatePayslip = async (payroll: any, hrName: string) => {
  const doc = new jsPDF();

  // --- Add Logo ---
  try {
    const logo = await fetch(logoUrl).then((res) => res.blob());
    const reader = new FileReader();
    reader.readAsDataURL(logo);
    await new Promise((resolve) => {
      reader.onloadend = () => {
        const base64Logo = reader.result as string;
        doc.addImage(base64Logo, "PNG", 15, 10, 25, 25); // x, y, w, h
        resolve(null);
      };
    });
  } catch (err) {
    console.warn("Logo not found, skipping...", err);
  }

  // --- Company Info ---
  doc.setFontSize(18);
  doc.text("Your Company Pvt Ltd", 105, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text("Official Salary Payslip", 105, 30, { align: "center" });

  // --- Employee Details (left-right alignment) ---
  autoTable(doc, {
    startY: 45,
    head: [["Employee Details", ""]],
    body: [
      ["Name", payroll.user?.name],
      ["Employee ID", payroll.user?.employeeId],
      ["Department", payroll.user?.department],
      ["Period", payroll.period],
    ],
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 11 },
  });

  // --- Salary Details ---
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Salary Component", "Amount (₹)"]],
    body: [
      ["Gross Salary", (payroll.gross || 0).toLocaleString()],
      ["Bonus", (payroll.bonus || 0).toLocaleString()],
      ["Deductions", (payroll.deductions || 0).toLocaleString()],
      ["Net Salary", (payroll.net || 0).toLocaleString()],
    ],
    theme: "grid",
    headStyles: { fillColor: [46, 204, 113], textColor: 255 },
    styles: { fontSize: 11 },
  });

  // --- Footer / HR Signature ---
  const footerY = doc.lastAutoTable.finalY + 30;
  doc.text(`Processed By: ${hrName}`, 20, footerY);
  doc.text("Authorized Signatory", 20, footerY + 30);
  doc.line(20, footerY + 25, 80, footerY + 25);

  // Footer note
  doc.setFontSize(9);
  doc.text(
    "This is a system-generated payslip and does not require a physical signature.",
    105,
    290,
    { align: "center" }
  );

  doc.save(`payslip-${payroll.user?.name}-${payroll.user?.employeeId}-${payroll.period}.pdf`);
};
