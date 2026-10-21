package com.packsure.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.packsure.model.*;
import com.packsure.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportGeneratorService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private StorageService storageService;

    @Value("${packsure.storage.path}")
    private String baseStoragePath;

    public Report generateReport(Inspection inspection, List<Declaration> declarations, List<RuleEvaluation> evaluations, String generatedBy) {
        String reportNum = "REP-" + inspection.getInspectionNumber();
        String filename = reportNum + ".pdf";

        try {
            Path reportDir = Paths.get(baseStoragePath, "reports");
            Files.createDirectories(reportDir);
            Path filePath = reportDir.resolve(filename);

            Document document = new Document(PageSize.A4, 36, 36, 40, 40);
            PdfWriter.getInstance(document, new FileOutputStream(filePath.toFile()));
            document.open();

            // Colors
            Color primaryNavy = new Color(10, 25, 47);
            Color textDark = new Color(30, 41, 59);
            Color lightBg = new Color(248, 250, 252);
            Color passGreen = new Color(22, 101, 52);
            Color alertRed = new Color(153, 27, 27);
            Color amberReview = new Color(146, 64, 14);

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 15, primaryNavy);
            Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.GRAY);
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, primaryNavy);
            Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 9, textDark);
            Font textBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, textDark);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.GRAY);

            // Header Table
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{3, 2});

            PdfPCell leftHeader = new PdfPCell();
            leftHeader.setBorder(Rectangle.NO_BORDER);
            leftHeader.addElement(new Paragraph("LEGAL METROLOGY INSPECTION REPORT", titleFont));
            leftHeader.addElement(new Paragraph("PackSure — AI-Assisted Packaged Commodity Screening Platform", subTitleFont));
            headerTable.addCell(leftHeader);

            PdfPCell rightHeader = new PdfPCell();
            rightHeader.setBorder(Rectangle.NO_BORDER);
            rightHeader.setHorizontalAlignment(Element.ALIGN_RIGHT);
            rightHeader.addElement(new Paragraph("Report: " + reportNum, textBold));
            rightHeader.addElement(new Paragraph("Inspection: " + inspection.getInspectionNumber(), textFont));
            rightHeader.addElement(new Paragraph("Date: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm")), smallFont));
            headerTable.addCell(rightHeader);

            document.add(headerTable);
            document.add(new Paragraph(" "));

            // Metadata Box
            PdfPTable metaTable = new PdfPTable(4);
            metaTable.setWidthPercentage(100);
            metaTable.setWidths(new float[]{1.5f, 2.5f, 1.5f, 2.5f});

            addMetaCell(metaTable, "Officer:", textBold, lightBg);
            addMetaCell(metaTable, inspection.getUser() != null ? inspection.getUser().getFullName() : "Enforcement Officer", textFont, lightBg);
            addMetaCell(metaTable, "Location:", textBold, lightBg);
            addMetaCell(metaTable, inspection.getLocation() != null ? inspection.getLocation() : "Retail Market", textFont, lightBg);

            addMetaCell(metaTable, "Product:", textBold, lightBg);
            addMetaCell(metaTable, inspection.getProduct() != null ? inspection.getProduct().getName() : "Packaged Commodity", textFont, lightBg);
            addMetaCell(metaTable, "Brand / Category:", textBold, lightBg);
            addMetaCell(metaTable, (inspection.getProduct() != null ? inspection.getProduct().getBrand() : "Generic") + " / " + (inspection.getProduct() != null ? inspection.getProduct().getCategory() : "FOOD"), textFont, lightBg);

            addMetaCell(metaTable, "Screening Score:", textBold, lightBg);
            addMetaCell(metaTable, inspection.getScreeningScore() + " / 100", textBold, lightBg);
            addMetaCell(metaTable, "Final Status:", textBold, lightBg);
            addMetaCell(metaTable, inspection.getFinalStatus() != null ? inspection.getFinalStatus() : "PENDING", textBold, lightBg);

            document.add(metaTable);
            document.add(new Paragraph(" "));

            // Extracted Declarations Table
            document.add(new Paragraph("MANDATORY DECLARATIONS & EVIDENCE", sectionFont));
            document.add(new Paragraph(" "));

            PdfPTable declTable = new PdfPTable(5);
            declTable.setWidthPercentage(100);
            declTable.setWidths(new float[]{2f, 2.5f, 1f, 1.5f, 1.5f});

            addHeaderCell(declTable, "Declaration");
            addHeaderCell(declTable, "Detected Value");
            addHeaderCell(declTable, "Confidence");
            addHeaderCell(declTable, "Officer Value");
            addHeaderCell(declTable, "Status");

            for (Declaration d : declarations) {
                declTable.addCell(new Phrase(d.getFieldName().replace("_", " "), textFont));
                declTable.addCell(new Phrase(d.getDisplayValue() != null ? d.getDisplayValue() : "—", textFont));
                int confPct = (int) Math.round((d.getFinalConfidence() != null ? d.getFinalConfidence() : 0.0) * 100);
                declTable.addCell(new Phrase(confPct + "%", textFont));
                declTable.addCell(new Phrase(d.getOfficerValue() != null ? d.getOfficerValue() : "Verified", textFont));

                Font statusFont = confPct >= 65 ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, passGreen) : FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, amberReview);
                declTable.addCell(new Phrase(confPct >= 65 ? "PASS" : "REVIEW", statusFont));
            }
            document.add(declTable);
            document.add(new Paragraph(" "));

            // Rule Findings Table
            document.add(new Paragraph("RULE ENGINE EVALUATION", sectionFont));
            document.add(new Paragraph(" "));

            PdfPTable ruleTable = new PdfPTable(4);
            ruleTable.setWidthPercentage(100);
            ruleTable.setWidths(new float[]{1.5f, 2.5f, 1.2f, 3.5f});

            addHeaderCell(ruleTable, "Rule Code");
            addHeaderCell(ruleTable, "Requirement");
            addHeaderCell(ruleTable, "Result");
            addHeaderCell(ruleTable, "Statutory Reference / Reasoning");

            for (RuleEvaluation re : evaluations) {
                ruleTable.addCell(new Phrase(re.getRule() != null ? re.getRule().getRuleCode() : "PCR", textFont));
                ruleTable.addCell(new Phrase(re.getRule() != null ? re.getRule().getTitle() : "Compliance Requirement", textFont));

                Color resColor = "PASS".equals(re.getResult()) ? passGreen : ("POTENTIAL_ISSUE".equals(re.getResult()) ? alertRed : amberReview);
                Font resFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, resColor);
                ruleTable.addCell(new Phrase(re.getResult(), resFont));

                String ref = (re.getRule() != null && re.getRule().getLegalReference() != null ? re.getRule().getLegalReference() + ": " : "") + (re.getReasoning() != null ? re.getReasoning() : "");
                ruleTable.addCell(new Phrase(ref, smallFont));
            }
            document.add(ruleTable);
            document.add(new Paragraph(" "));

            // Officer Remarks
            document.add(new Paragraph("OFFICER REMARKS & CONCLUSION", sectionFont));
            Paragraph remarks = new Paragraph(inspection.getOfficerRemarks() != null ? inspection.getOfficerRemarks() : "No remarks provided. Inspection completed in accordance with Legal Metrology Act & Packaged Commodities Rules.", textFont);
            document.add(remarks);
            document.add(new Paragraph(" "));

            // Disclaimer & Integrity Footer
            Paragraph disclaimer = new Paragraph("AI-Assisted screening platform. Final statutory determination is subject to authorized enforcement officer verification under the Legal Metrology Act, 2009 and Packaged Commodities Rules, 2011.", smallFont);
            document.add(disclaimer);

            document.close();

            // Compute SHA-256 integrity hash
            String hash = storageService.computeFileHash(filePath.toString());

            Report report = new Report(inspection, reportNum, filePath.toString(), hash, generatedBy);
            return reportRepository.save(report);

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate official PDF report: " + e.getMessage(), e);
        }
    }

    private void addMetaCell(PdfPTable table, String text, Font font, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setPadding(5);
        cell.setBorderColor(new Color(226, 232, 240));
        table.addCell(cell);
    }

    private void addHeaderCell(PdfPTable table, String text) {
        Font f = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);
        PdfPCell cell = new PdfPCell(new Phrase(text, f));
        cell.setBackgroundColor(new Color(10, 25, 47));
        cell.setPadding(6);
        table.addCell(cell);
    }
}
