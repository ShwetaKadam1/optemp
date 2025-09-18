// lib/payslip.js
import jsPDF from "jspdf";
import "jspdf-autotable";

export function generatePayslip({ employee, period, gross, net, breakdown = [] }) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Payslip", 14, 20);

  doc.setFontSize(11);
  doc.text(`Employee: ${employee.name} (${employee.employeeId})`, 14, 30);
  doc.text(`Department: ${employee.department}`, 14, 36);
  doc.text(`Period: ${period}`, 14, 42);

  doc.autoTable({
    startY: 50,
    head: [["Component", "Amount (INR)"]],
    body: breakdown.map((b) => [b.label, String(b.amount)]),
  });

  doc.text(`Gross: ₹${gross}`, 14, doc.lastAutoTable.finalY + 10);
  doc.text(`Net: ₹${net}`, 14, doc.lastAutoTable.finalY + 16);

  doc.save(`Payslip_${employee.employeeId}_${period}.pdf`);
}
