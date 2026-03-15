package com.erp.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * PdfService — generates mark statements and fee receipts using iText 5.
 * Both methods return a byte[] that can be streamed as application/pdf.
 */
@Service
public class PdfService {

    @Autowired private MarksService   marksService;
    @Autowired private FeeService     feeService;
    @Autowired private StudentService studentService;

    // ── Colours ──────────────────────────────────────────────
    private static final BaseColor DARK  = new BaseColor(15, 23, 42);   // #0f172a
    private static final BaseColor TEAL  = new BaseColor(20, 184, 166); // #14b8a6
    private static final BaseColor GREEN = new BaseColor(34, 197, 94);  // #22c55e
    private static final BaseColor RED   = new BaseColor(239, 68, 68);  // #ef4444
    private static final BaseColor GREY  = new BaseColor(148, 163, 184);// #94a3b8
    private static final BaseColor LIGHT = new BaseColor(248, 255, 254);// #f8fffe

    // ── Fonts ────────────────────────────────────────────────
    private static final Font TITLE_FONT  = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD,   DARK);
    private static final Font HEAD_FONT   = new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD,   BaseColor.WHITE);
    private static final Font BODY_FONT   = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, DARK);
    private static final Font BOLD_FONT   = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD,   DARK);
    private static final Font SMALL_FONT  = new Font(Font.FontFamily.HELVETICA,  9, Font.NORMAL, GREY);
    private static final Font PASS_FONT   = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD,   GREEN);
    private static final Font FAIL_FONT   = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD,   RED);

    // ════════════════════════════════════════════════════════════
    // MARK STATEMENT — single semester
    // ════════════════════════════════════════════════════════════
    public byte[] generateMarkStatement(String username, int semester) {
        try {
            var student = studentService.getStudentProfile(username);
            var marks   = marksService.getStudentMarks(username, semester);
            return buildMarksPdf(student, marks, semester);
        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed: " + e.getMessage(), e);
        }
    }

    public byte[] generateFullMarkStatement(String username) {
        try {
            var student  = studentService.getStudentProfile(username);
            var allMarks = marksService.getAllStudentMarks(username);
            return buildFullMarksPdf(student, allMarks);
        } catch (Exception e) {
            throw new RuntimeException("Full PDF generation failed: " + e.getMessage(), e);
        }
    }

    // ════════════════════════════════════════════════════════════
    // FEE RECEIPT
    // ════════════════════════════════════════════════════════════
    public byte[] generateFeeReceipt(Long receiptId, String username) {
        try {
            var receipt = feeService.getReceiptById(receiptId, username);
            return buildReceiptPdf(receipt);
        } catch (Exception e) {
            throw new RuntimeException("Receipt PDF failed: " + e.getMessage(), e);
        }
    }

    // ── Private builders ─────────────────────────────────────
    private byte[] buildMarksPdf(Object student, Object marks, int sem) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4.rotate(), 30, 30, 40, 40);
        PdfWriter.getInstance(doc, baos);
        doc.open();

        // Header
        Paragraph title = new Paragraph("EduSync ERP — Mark Statement", TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        doc.add(title);
        Paragraph sub = new Paragraph("Semester " + sem + "   ·   " +
            LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy")), SMALL_FONT);
        sub.setAlignment(Element.ALIGN_CENTER);
        sub.setSpacingAfter(16);
        doc.add(sub);

        // Student info table
        PdfPTable info = new PdfPTable(4);
        info.setWidthPercentage(100);
        info.setSpacingAfter(16);
        addInfoCell(info, "Student Name", student.toString()); // replace with DTO fields
        addInfoCell(info, "Register No.", "21CSE001");
        addInfoCell(info, "Department",   "CSE");
        addInfoCell(info, "Batch",        "2021–2025");
        doc.add(info);

        // Marks table
        PdfPTable table = new PdfPTable(10);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{2f, 3.5f, 1.2f, 1.2f, 1.2f, 1.2f, 1.5f, 1.5f, 1.2f, 1.5f});
        String[] headers = {"Code","Subject","CIA 1","CIA 2","CIA 3","CIA /25","Sem /100","Total","Grade","Result"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, HEAD_FONT));
            cell.setBackgroundColor(DARK);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(7);
            table.addCell(cell);
        }
        // Rows would be filled from `marks` DTO here
        doc.add(table);

        // Footer
        Paragraph footer = new Paragraph(
            "This is a computer-generated statement. No signature required.   |   EduSync ERP", SMALL_FONT);
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.setSpacingBefore(20);
        doc.add(footer);

        doc.close();
        return baos.toByteArray();
    }

    private byte[] buildFullMarksPdf(Object student, Object allMarks) throws Exception {
        // Same pattern as above but loops through all semesters
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4.rotate(), 30, 30, 40, 40);
        PdfWriter.getInstance(doc, baos);
        doc.open();
        Paragraph title = new Paragraph("EduSync ERP — Full Mark Statement (All Semesters)", TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        doc.add(title);
        // Loop semesters from allMarks DTO
        doc.close();
        return baos.toByteArray();
    }

    private byte[] buildReceiptPdf(Object receipt) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(new Rectangle(400, 600), 30, 30, 30, 30);
        PdfWriter writer = PdfWriter.getInstance(doc, baos);
        doc.open();
        PdfContentByte canvas = writer.getDirectContent();

        // Header
        Paragraph title = new Paragraph("EduSync ERP", TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        doc.add(title);
        Paragraph sub = new Paragraph("Fee Payment Receipt", SMALL_FONT);
        sub.setAlignment(Element.ALIGN_CENTER);
        sub.setSpacingAfter(16);
        doc.add(sub);

        // Receipt number box
        PdfPTable box = new PdfPTable(1);
        box.setWidthPercentage(100);
        PdfPCell rcell = new PdfPCell(new Phrase("RECEIPT: RCP2024001", BOLD_FONT));
        rcell.setBackgroundColor(new BaseColor(240, 253, 244));
        rcell.setHorizontalAlignment(Element.ALIGN_CENTER);
        rcell.setPadding(10);
        box.addCell(rcell);
        box.setSpacingAfter(14);
        doc.add(box);

        // Details rows filled from receipt DTO
        doc.close();
        return baos.toByteArray();
    }

    private void addInfoCell(PdfPTable table, String label, String value) {
        PdfPCell cell = new PdfPCell();
        cell.addElement(new Phrase(label, SMALL_FONT));
        cell.addElement(new Phrase(value, BOLD_FONT));
        cell.setBackgroundColor(LIGHT);
        cell.setPadding(8);
        cell.setBorderColor(new BaseColor(232, 244, 243));
        table.addCell(cell);
    }
}
