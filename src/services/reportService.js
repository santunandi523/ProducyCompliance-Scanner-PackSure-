import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInspectionPdf = ({ inspection, analysis, officer, remarks }) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();

  // Header band
  doc.setFillColor(10, 25, 47);
  doc.rect(0, 0, pageW, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("LEGAL METROLOGY PACKAGED COMMODITY INSPECTION REPORT", 40, 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("PackSure — AI-assisted screening platform", 40, 52);

  // Metadata block
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  const meta = [
    ["Inspection ID", inspection.id || "—"],
    ["Date", inspection.date || new Date().toLocaleString()],
    ["Officer", officer?.name || "—"],
    ["Role", officer?.role || "Enforcement Officer"],
    ["Employee ID", officer?.employeeId || "—"],
    ["Location", inspection.location || "—"],
  ];
  let y = 92;
  meta.forEach(([k, v], idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 40 + col * 270;
    const yy = y + row * 18;
    doc.setFont("helvetica", "bold");
    doc.text(`${k}:`, x, yy);
    doc.setFont("helvetica", "normal");
    doc.text(String(v), x + 80, yy);
  });

  // Product info
  y += 76;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Product Information", 40, y);
  y += 8;
  doc.setDrawColor(226, 232, 240);
  doc.line(40, y, pageW - 40, y);
  y += 14;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${inspection.product || analysis?.product?.name || "—"}`, 40, y); y += 14;
  doc.text(`Brand: ${analysis?.product?.brand || "—"}`, 40, y); y += 14;
  doc.text(`Category: ${analysis?.product?.category || "—"}`, 40, y); y += 14;
  doc.text(`Manufacturer: ${analysis?.product?.manufacturer || "—"}`, 40, y); y += 14;

  // Screening summary
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Inspection Summary", 40, y);
  y += 8;
  doc.line(40, y, pageW - 40, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Screening Score: ${analysis?.screeningScore ?? "—"} / 100`, 40, y);
  doc.text(`Overall Status: ${inspection.result || analysis?.overallStatus || "—"}`, 260, y);

  // Declarations table
  const rows = (analysis?.declarations || []).map((d) => [
    d.label,
    d.value || "—",
    `${Math.round((d.confidence || 0) * 100)}%`,
    d.status,
    d.officerVerified ? "Verified" : "AI only",
    d.finalStatus || d.status,
  ]);

  autoTable(doc, {
    startY: y + 18,
    head: [["Requirement", "Detected Value", "Confidence", "AI Result", "Officer", "Final"]],
    body: rows,
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 40, right: 40 },
  });

  let afterY = doc.lastAutoTable.finalY + 20;

  // Potential violations
  const viols = analysis?.violations || [];
  if (viols.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Potential Non-Compliance Items", 40, afterY);
    afterY += 6;
    doc.line(40, afterY, pageW - 40, afterY);
    afterY += 4;
    autoTable(doc, {
      startY: afterY + 6,
      head: [["Rule", "Field", "Severity", "Status", "Reason"]],
      body: viols.map((v) => [v.ruleCode, v.field, v.severity, v.status, v.reason]),
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [185, 28, 28], textColor: 255 },
      margin: { left: 40, right: 40 },
    });
    afterY = doc.lastAutoTable.finalY + 16;
  }

  // Remarks
  if (afterY > 720) { doc.addPage(); afterY = 60; }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Officer Remarks", 40, afterY);
  afterY += 6;
  doc.line(40, afterY, pageW - 40, afterY);
  afterY += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const remarkText = doc.splitTextToSize(remarks || "No remarks provided.", pageW - 80);
  doc.text(remarkText, 40, afterY);

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(40, 800, pageW - 40, 800);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "AI-assisted screening system. Final determination is subject to authorized officer verification and applicable rules.",
    40, 815
  );
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageW - 40, 815, { align: "right" });

  const filename = `PackSure-${inspection.id || "Inspection"}.pdf`;
  doc.save(filename);
  return filename;
};