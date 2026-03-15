package com.erp.controller;

import com.erp.dto.*;
import com.erp.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/staff")
@PreAuthorize("hasAnyRole('STAFF','ADMIN')")
@CrossOrigin(origins = "*")
public class StaffController {

    @Autowired private AttendanceService attendanceService;
    @Autowired private MarksService      marksService;
    @Autowired private StudentService    studentService;
    @Autowired private StaffService      staffService;

    // ── Dashboard ──────────────────────────────────────────────
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication auth) {
        return ResponseEntity.ok(staffService.getStaffDashboard(auth.getName()));
    }

    // ── Attendance: Hour-based ──────────────────────────────────
    /** List periods assigned to this staff today */
    @GetMapping("/attendance/periods")
    public ResponseEntity<?> getMyPeriods(@RequestParam(required=false) String date, Authentication auth) {
        LocalDate d = date != null ? LocalDate.parse(date) : LocalDate.now();
        return ResponseEntity.ok(attendanceService.getStaffPeriods(auth.getName(), d));
    }

    /** Fetch saved attendance for subjectId + date */
    @GetMapping("/attendance")
    public ResponseEntity<?> getAttendance(@RequestParam Long subjectId, @RequestParam String date, Authentication auth) {
        return ResponseEntity.ok(attendanceService.getAttendance(auth.getName(), subjectId, LocalDate.parse(date)));
    }

    /**
     * POST /api/staff/attendance
     * Body: { subjectId, date, records:[{studentId, periodId, status:"P/A/OD/L"}] }
     */
    @PostMapping("/attendance")
    public ResponseEntity<?> saveAttendance(@RequestBody AttendanceSaveRequest req, Authentication auth) {
        try {
            attendanceService.saveAttendance(auth.getName(), req);
            return ResponseEntity.ok("Attendance saved successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /** Correct single record */
    @PutMapping("/attendance/{id}")
    public ResponseEntity<?> updateAttendance(@PathVariable Long id,
            @RequestBody AttendanceUpdateRequest req, Authentication auth) {
        try { return ResponseEntity.ok(attendanceService.updateRecord(id, req, auth.getName())); }
        catch (Exception e) { return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage())); }
    }

    /** Hour-based % summary per student per subject */
    @GetMapping("/attendance/summary")
    public ResponseEntity<?> getAttendanceSummary(
            @RequestParam(required=false) Long    studentId,
            @RequestParam(required=false) Long    subjectId,
            @RequestParam(required=false) String  dept,
            @RequestParam(required=false) Integer semester,
            Authentication auth) {
        return ResponseEntity.ok(attendanceService.getSummary(auth.getName(), studentId, subjectId, dept, semester));
    }

    // ── CIA Marks ──────────────────────────────────────────────
    @GetMapping("/marks/cia")
    public ResponseEntity<?> getCiaMarks(@RequestParam Long subjectId, @RequestParam int semester, Authentication auth) {
        return ResponseEntity.ok(marksService.getCiaMarks(subjectId, semester, auth.getName()));
    }

    /**
     * POST /api/staff/marks/cia
     * Body: { subjectId, semester, ciaNumber:1/2/3, records:[{studentId, marks}] }
     */
    @PostMapping("/marks/cia")
    public ResponseEntity<?> saveCiaMarks(@RequestBody CiaMarksSaveRequest req, Authentication auth) {
        try { marksService.saveCiaMarks(req, auth.getName()); return ResponseEntity.ok("CIA marks saved"); }
        catch (IllegalStateException e) { return ResponseEntity.status(403).body(new ErrorResponse(e.getMessage())); }
        catch (Exception e) { return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage())); }
    }

    @PutMapping("/marks/cia/{id}")
    public ResponseEntity<?> updateCiaMark(@PathVariable Long id,
            @RequestBody CiaMarkUpdateRequest req, Authentication auth) {
        try { return ResponseEntity.ok(marksService.updateCiaMark(id, req, auth.getName())); }
        catch (Exception e) { return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage())); }
    }

    // ── Semester Marks ─────────────────────────────────────────
    @GetMapping("/marks/semester")
    public ResponseEntity<?> getSemesterMarks(@RequestParam Long subjectId, @RequestParam int semester, Authentication auth) {
        return ResponseEntity.ok(marksService.getSemesterMarks(subjectId, semester, auth.getName()));
    }

    /**
     * POST /api/staff/marks/semester
     * Body: { subjectId, semester, records:[{studentId, marks}] }
     */
    @PostMapping("/marks/semester")
    public ResponseEntity<?> saveSemesterMarks(@RequestBody SemesterMarksSaveRequest req, Authentication auth) {
        try { marksService.saveSemesterMarks(req, auth.getName()); return ResponseEntity.ok("Semester marks saved"); }
        catch (IllegalStateException e) { return ResponseEntity.status(403).body(new ErrorResponse(e.getMessage())); }
    }

    @PutMapping("/marks/semester/{id}")
    public ResponseEntity<?> updateSemesterMark(@PathVariable Long id,
            @RequestBody SemesterMarkUpdateRequest req, Authentication auth) {
        return ResponseEntity.ok(marksService.updateSemesterMark(id, req, auth.getName()));
    }

    // ── Students ───────────────────────────────────────────────
    @GetMapping("/students")
    public ResponseEntity<?> getStudents(@RequestParam(required=false) String search, Authentication auth) {
        return ResponseEntity.ok(studentService.getStudentsByStaff(auth.getName(), search));
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<?> getStudent(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentDetail(id));
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody StudentUpdateRequest req) {
        return ResponseEntity.ok(studentService.updateBasicDetails(id, req));
    }

    record ErrorResponse(String message) {}
}
