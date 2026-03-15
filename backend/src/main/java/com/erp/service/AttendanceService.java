package com.erp.service;

import com.erp.dto.*;
import com.erp.model.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    @Autowired private AttendanceRepository  attRepo;
    @Autowired private StudentRepository     studentRepo;
    @Autowired private SubjectRepository     subjectRepo;
    @Autowired private StaffRepository       staffRepo;

    // ── Save / overwrite attendance for one date+subject ──────────
    @Transactional
    public void saveAttendance(String staffUsername, AttendanceSaveRequest req) {
        Staff   staff   = staffRepo.findByUser_Username(staffUsername)
            .orElseThrow(() -> new IllegalArgumentException("Staff not found"));
        Subject subject = subjectRepo.findById(req.getSubjectId())
            .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
        LocalDate date  = LocalDate.parse(req.getDate());

        for (var r : req.getRecords()) {
            Student student = studentRepo.findById(r.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student " + r.getStudentId() + " not found"));

            Attendance.Status status;
            try { status = Attendance.Status.valueOf(r.getStatus()); }
            catch (Exception e) { status = Attendance.Status.A; }

            // Upsert — find existing or create new
            var existing = attRepo.findByStudent_IdAndSubject_IdAndDateAndPeriodNumber(
                student.getId(), subject.getId(), date, r.getPeriodId()
            );
            Attendance att = existing.orElse(Attendance.builder()
                .student(student).subject(subject).staff(staff)
                .date(date).periodNumber(r.getPeriodId()).build()
            );
            att.setStatus(status);
            att.setStaff(staff);
            attRepo.save(att);
        }
    }

    // ── Fetch saved records for a subject+date ─────────────────────
    public List<Map<String, Object>> getAttendance(String staffUsername, Long subjectId, LocalDate date) {
        return attRepo.findBySubject_IdAndDate(subjectId, date).stream().map(a -> {
            Map<String, Object> m = new HashMap<>();
            m.put("studentId", a.getStudent().getId());
            m.put("studentName", a.getStudent().getName());
            m.put("periodId", a.getPeriodNumber());
            m.put("status", a.getStatus().name());
            return m;
        }).collect(Collectors.toList());
    }

    // ── Update single record ───────────────────────────────────────
    @Transactional
    public Map<String, Object> updateRecord(Long id, AttendanceUpdateRequest req, String username) {
        Attendance att = attRepo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Attendance record not found"));
        att.setStatus(Attendance.Status.valueOf(req.getStatus()));
        attRepo.save(att);
        return Map.of("id", att.getId(), "status", att.getStatus().name());
    }

    // ── Summary: % per student per subject ────────────────────────
    public List<Map<String, Object>> getSummary(String staffUsername,
            Long studentId, Long subjectId, String dept, Integer semester) {
        List<Map<String, Object>> result = new ArrayList<>();
        Staff staff = staffRepo.findByUser_Username(staffUsername).orElse(null);
        if (staff == null) return result;

        List<Student> students = studentId != null
            ? studentRepo.findById(studentId).map(List::of).orElse(List.of())
            : studentRepo.findByDepartment_Id(staff.getDepartment().getId());

        List<Subject> subjects = subjectId != null
            ? subjectRepo.findById(subjectId).map(List::of).orElse(List.of())
            : subjectRepo.findByDepartment_Id(staff.getDepartment().getId());

        for (Student s : students) {
            for (Subject sub : subjects) {
                long total   = attRepo.countTotal(s.getId(), sub.getId());
                long present = attRepo.countPresent(s.getId(), sub.getId());
                double pct   = total > 0 ? Math.round((present * 100.0) / total) : 0;
                result.add(Map.of(
                    "studentId",   s.getId(),
                    "studentName", s.getName(),
                    "registerNo",  s.getRegisterNo(),
                    "subjectId",   sub.getId(),
                    "subjectName", sub.getName(),
                    "total",       total,
                    "present",     present,
                    "percentage",  pct
                ));
            }
        }
        return result;
    }

    // ── Student-facing: their own attendance ──────────────────────
    public List<Map<String, Object>> getStudentAttendance(String username, int semester) {
        Student student = studentRepo.findByUser_Username(username)
            .orElseThrow(() -> new RuntimeException("Student not found"));
        int sem = semester == 0 ? student.getCurrentSemester() : semester;
        List<Subject> subjects = subjectRepo.findByDepartment_IdAndSemester(
            student.getDepartment().getId(), sem);

        return subjects.stream().map(sub -> {
            long total   = attRepo.countTotal(student.getId(), sub.getId());
            long present = attRepo.countPresent(student.getId(), sub.getId());
            double pct   = total > 0 ? Math.round((present * 100.0) / total) : 0;
            Map<String, Object> m = new HashMap<>();
            m.put("subjectCode",    sub.getCode());
            m.put("subjectName",    sub.getName());
            m.put("totalHours",     total);
            m.put("attendedHours",  present);
            m.put("percentage",     pct);
            m.put("eligible",       pct >= 75);
            return m;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getStudentSubjectDetail(String username, Long subjectId) {
        Student student = studentRepo.findByUser_Username(username)
            .orElseThrow(() -> new RuntimeException("Student not found"));
        return attRepo.findByStudent_IdAndSubject_Id(student.getId(), subjectId)
            .stream().map(a -> Map.of(
                "date",         a.getDate().toString(),
                "periodNumber", (Object) a.getPeriodNumber(),
                "status",       a.getStatus().name()
            )).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getStaffPeriods(String username, LocalDate date) {
        // Returns period slots assigned to this staff for the given date
        return List.of(
            Map.of("id",1,"label","Period 1","time","9:00-10:00"),
            Map.of("id",2,"label","Period 2","time","10:00-11:00"),
            Map.of("id",3,"label","Period 3","time","11:00-12:00"),
            Map.of("id",4,"label","Period 4","time","14:00-15:00"),
            Map.of("id",5,"label","Period 5","time","15:00-16:00"),
            Map.of("id",6,"label","Period 6","time","16:00-17:00")
        );
    }
}
