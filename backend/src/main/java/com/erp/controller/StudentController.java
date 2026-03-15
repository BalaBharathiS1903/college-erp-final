package com.erp.controller;

import com.erp.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired private StudentService    studentService;
    @Autowired private AttendanceService attendanceService;
    @Autowired private MarksService      marksService;
    @Autowired private FeeService        feeService;
    @Autowired private PdfService        pdfService;

    // ── Dashboard ──────────────────────────────────────────────
    /** GET /api/student/dashboard — stats for logged-in student */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication auth) {
        return ResponseEntity.ok(studentService.getStudentDashboard(auth.getName()));
    }

    // ── Attendance ─────────────────────────────────────────────
    /**
     * GET /api/student/attendance
     * Returns hour-based attendance summary per subject for current semester.
     * Response: [ { subjectCode, subjectName, present, total, percentage } ]
     */
    @GetMapping("/attendance")
    public ResponseEntity<?> getAttendance(
            @RequestParam(defaultValue = "0") int semester, // 0 = current
            Authentication auth) {
        return ResponseEntity.ok(
            attendanceService.getStudentAttendance(auth.getName(), semester)
        );
    }

    /**
     * GET /api/student/attendance/detail?subjectId=1
     * Returns day-wise, period-wise attendance for one subject.
     */
    @GetMapping("/attendance/detail")
    public ResponseEntity<?> getAttendanceDetail(
            @RequestParam Long subjectId,
            Authentication auth) {
        return ResponseEntity.ok(
            attendanceService.getStudentSubjectDetail(auth.getName(), subjectId)
        );
    }

    // ── Marks ──────────────────────────────────────────────────
    /**
     * GET /api/student/marks?semester=6
     * Returns CIA 1, 2, 3 + Semester marks for all subjects in that semester.
     * If semester=0, returns current semester.
     * Response: { semester, subjects: [ { code, name, cia1, cia2, cia3, semMarks, grade, result } ] }
     */
    @GetMapping("/marks")
    public ResponseEntity<?> getMarks(
            @RequestParam(defaultValue = "0") int semester,
            Authentication auth) {
        return ResponseEntity.ok(marksService.getStudentMarks(auth.getName(), semester));
    }

    /**
     * GET /api/student/marks/all
     * Returns marks for ALL 8 semesters in one response.
     * Used to build the full mark statement.
     */
    @GetMapping("/marks/all")
    public ResponseEntity<?> getAllMarks(Authentication auth) {
        return ResponseEntity.ok(marksService.getAllStudentMarks(auth.getName()));
    }

    /**
     * GET /api/student/marks/download?semester=6
     * Generates and returns a PDF mark statement for the given semester.
     * Returns: application/pdf binary stream.
     */
    @GetMapping("/marks/download")
    public ResponseEntity<byte[]> downloadMarkStatement(
            @RequestParam int semester,
            Authentication auth) {
        byte[] pdf = pdfService.generateMarkStatement(auth.getName(), semester);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=MarkStatement_Sem" + semester + ".pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdf);
    }

    /**
     * GET /api/student/marks/download/all
     * Generates a combined PDF mark statement for all completed semesters.
     */
    @GetMapping("/marks/download/all")
    public ResponseEntity<byte[]> downloadAllMarkStatements(Authentication auth) {
        byte[] pdf = pdfService.generateFullMarkStatement(auth.getName());
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=MarkStatement_All.pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdf);
    }

    // ── Fees ───────────────────────────────────────────────────
    /**
     * GET /api/student/fees?year=2024-25
     * Returns fee allocations and payment status.
     * Response: { allocated, paid, balance, items: [...], receipts: [...] }
     */
    @GetMapping("/fees")
    public ResponseEntity<?> getFees(
            @RequestParam(defaultValue = "current") String year,
            Authentication auth) {
        return ResponseEntity.ok(feeService.getStudentFees(auth.getName(), year));
    }

    /**
     * POST /api/student/fees/pay
     * Initiates a fee payment.
     *
     * Body: {
     *   "feeAllocationId": 3,
     *   "amount":          1500.00,
     *   "paymentMode":     "ONLINE",   // CASH | ONLINE | CHEQUE | DD
     *   "transactionId":   "TXN123456" // required for ONLINE
     * }
     */
    @PostMapping("/fees/pay")
    public ResponseEntity<?> payFee(
            @RequestBody FeePaymentRequest req,
            Authentication auth) {
        try {
            var receipt = feeService.processPayment(auth.getName(), req.feeAllocationId(), req.amount(), req.paymentMode(), req.transactionId());
            return ResponseEntity.ok(receipt);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/student/fees/receipt/{receiptId}
     * Returns HTML/PDF receipt for a payment.
     */
    @GetMapping("/fees/receipt/{receiptId}")
    public ResponseEntity<byte[]> downloadReceipt(
            @PathVariable Long receiptId,
            Authentication auth) {
        byte[] pdf = pdfService.generateFeeReceipt(receiptId, auth.getName());
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=Receipt_" + receiptId + ".pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdf);
    }

    /**
     * GET /api/student/fees/receipts
     * Returns list of all payment receipts for this student.
     */
    @GetMapping("/fees/receipts")
    public ResponseEntity<?> getAllReceipts(Authentication auth) {
        return ResponseEntity.ok(feeService.getStudentReceipts(auth.getName()));
    }

    // ── Profile ────────────────────────────────────────────────
    /** GET /api/student/profile */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {
        return ResponseEntity.ok(studentService.getStudentProfile(auth.getName()));
    }

    // ── Inner classes for request bodies ──────────────────────
    record FeePaymentRequest(Long feeAllocationId, Double amount,
                             String paymentMode, String transactionId) {}
    record ErrorResponse(String message) {}
}
