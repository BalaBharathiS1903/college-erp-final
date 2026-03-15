package com.erp.service;

import com.erp.dto.*;
import com.erp.model.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MarksService {

    @Autowired private CiaMarksRepository  ciaRepo;
    @Autowired private SemMarksRepository  semRepo;
    @Autowired private StudentRepository   studentRepo;
    @Autowired private SubjectRepository   subjectRepo;
    @Autowired private StaffRepository     staffRepo;

    // ── CIA: get all marks for a subject ──────────────────────────
    public List<Map<String, Object>> getCiaMarks(Long subjectId, int semester, String staffUsername) {
        Subject subject = subjectRepo.findById(subjectId)
            .orElseThrow(() -> new RuntimeException("Subject not found"));
        Staff staff = staffRepo.findByUser_Username(staffUsername)
            .orElseThrow(() -> new RuntimeException("Staff not found"));

        List<Student> students = studentRepo.findByDepartment_IdAndCurrentSemester(
            staff.getDepartment().getId(), semester);

        return students.stream().map(s -> {
            Map<String, Object> m = new HashMap<>();
            m.put("studentId",   s.getId());
            m.put("studentName", s.getName());
            m.put("registerNo",  s.getRegisterNo());
            for (int n = 1; n <= 3; n++) {
                int num = n;
                m.put("cia" + n, ciaRepo
                    .findByStudent_IdAndSubject_IdAndCiaNumber(s.getId(), subjectId, num)
                    .map(CiaMarks::getMarksObtained).orElse(null));
            }
            return m;
        }).collect(Collectors.toList());
    }

    // ── CIA: save marks for one exam ──────────────────────────────
    @Transactional
    public void saveCiaMarks(CiaMarksSaveRequest req, String staffUsername) {
        Staff staff = staffRepo.findByUser_Username(staffUsername)
            .orElseThrow(() -> new RuntimeException("Staff not found"));
        Subject subject = subjectRepo.findById(req.getSubjectId())
            .orElseThrow(() -> new RuntimeException("Subject not found"));

        for (var r : req.getRecords()) {
            Student student = studentRepo.findById(r.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found: " + r.getStudentId()));

            var existing = ciaRepo.findByStudent_IdAndSubject_IdAndCiaNumber(
                student.getId(), subject.getId(), req.getCiaNumber());

            CiaMarks marks = existing.orElse(CiaMarks.builder()
                .student(student).subject(subject)
                .ciaNumber(req.getCiaNumber()).maxMarks(50).build());

            marks.setMarksObtained(Math.min(50, Math.max(0, r.getMarks())));
            marks.setEnteredBy(staff.getUser().getId());
            ciaRepo.save(marks);
        }
    }

    // ── CIA: update single record ─────────────────────────────────
    @Transactional
    public Map<String, Object> updateCiaMark(Long id, CiaMarkUpdateRequest req, String username) {
        CiaMarks m = ciaRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("CIA mark not found"));
        m.setMarksObtained(Math.min(50, Math.max(0, req.getMarks())));
        ciaRepo.save(m);
        return Map.of("id", m.getId(), "marks", m.getMarksObtained());
    }

    // ── Semester: get ─────────────────────────────────────────────
    public List<Map<String, Object>> getSemesterMarks(Long subjectId, int semester, String staffUsername) {
        Staff staff = staffRepo.findByUser_Username(staffUsername)
            .orElseThrow(() -> new RuntimeException("Staff not found"));
        List<Student> students = studentRepo.findByDepartment_IdAndCurrentSemester(
            staff.getDepartment().getId(), semester);

        return students.stream().map(s -> {
            Map<String, Object> m = new HashMap<>();
            m.put("studentId",   s.getId());
            m.put("studentName", s.getName());
            m.put("registerNo",  s.getRegisterNo());
            m.put("marks", semRepo.findByStudent_IdAndSubject_Id(s.getId(), subjectId)
                .map(SemesterMarks::getMarksObtained).orElse(null));
            return m;
        }).collect(Collectors.toList());
    }

    // ── Semester: save ────────────────────────────────────────────
    @Transactional
    public void saveSemesterMarks(SemesterMarksSaveRequest req, String staffUsername) {
        Staff staff = staffRepo.findByUser_Username(staffUsername)
            .orElseThrow(() -> new RuntimeException("Staff not found"));
        Subject subject = subjectRepo.findById(req.getSubjectId())
            .orElseThrow(() -> new RuntimeException("Subject not found"));

        for (var r : req.getRecords()) {
            Student student = studentRepo.findById(r.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found: " + r.getStudentId()));

            var existing = semRepo.findByStudent_IdAndSubject_Id(student.getId(), subject.getId());
            SemesterMarks marks = existing.orElse(SemesterMarks.builder()
                .student(student).subject(subject).maxMarks(100).build());

            marks.setMarksObtained(Math.min(100, Math.max(0, r.getMarks())));
            marks.setEnteredBy(staff.getUser().getId());
            semRepo.save(marks);
        }
    }

    // ── Semester: update single ───────────────────────────────────
    @Transactional
    public Map<String, Object> updateSemesterMark(Long id, SemesterMarkUpdateRequest req, String username) {
        SemesterMarks m = semRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Semester mark not found"));
        m.setMarksObtained(Math.min(100, Math.max(0, req.getMarks())));
        semRepo.save(m);
        return Map.of("id", m.getId(), "marks", m.getMarksObtained());
    }

    // ── Student-facing: marks for a semester ──────────────────────
    public List<Map<String, Object>> getStudentMarks(String username, int semester) {
        Student student = studentRepo.findByUser_Username(username)
            .orElseThrow(() -> new RuntimeException("Student not found"));
        int sem = semester == 0 ? student.getCurrentSemester() : semester;
        List<Subject> subjects = subjectRepo.findByDepartment_IdAndSemester(
            student.getDepartment().getId(), sem);

        return subjects.stream().map(sub -> {
            int c1 = ciaRepo.findByStudent_IdAndSubject_IdAndCiaNumber(student.getId(), sub.getId(), 1)
                .map(CiaMarks::getMarksObtained).orElse(0);
            int c2 = ciaRepo.findByStudent_IdAndSubject_IdAndCiaNumber(student.getId(), sub.getId(), 2)
                .map(CiaMarks::getMarksObtained).orElse(0);
            int c3 = ciaRepo.findByStudent_IdAndSubject_IdAndCiaNumber(student.getId(), sub.getId(), 3)
                .map(CiaMarks::getMarksObtained).orElse(0);
            int best2 = computeBest2(c1, c2, c3);
            int scaled = Math.round((best2 / 100f) * 25);

            Integer semMark = semRepo.findByStudent_IdAndSubject_Id(student.getId(), sub.getId())
                .map(SemesterMarks::getMarksObtained).orElse(null);
            String grade = semMark != null ? computeGrade(semMark) : "—";

            Map<String, Object> m = new HashMap<>();
            m.put("subjectCode",  sub.getCode());
            m.put("subjectName",  sub.getName());
            m.put("credits",      sub.getCredits());
            m.put("cia1",         c1); m.put("cia2", c2); m.put("cia3", c3);
            m.put("best2",        best2);
            m.put("scaled",       scaled);
            m.put("semMarks",     semMark);
            m.put("grade",        grade);
            m.put("result",       semMark != null && semMark >= 50 ? "PASS" : "FAIL");
            return m;
        }).collect(Collectors.toList());
    }

    // ── All semesters for student ─────────────────────────────────
    public Map<Integer, Object> getAllStudentMarks(String username) {
        Map<Integer, Object> result = new LinkedHashMap<>();
        for (int sem = 1; sem <= 8; sem++) {
            result.put(sem, getStudentMarks(username, sem));
        }
        return result;
    }

    // ── GPA per semester + CGPA ───────────────────────────────────
    public Map<String, Object> getStudentGpa(String username) {
        Student student = studentRepo.findByUser_Username(username)
            .orElseThrow(() -> new RuntimeException("Student not found"));
        Map<String, Integer> gp = Map.of("O",10,"A+",9,"A",8,"B+",7,"B",6,"F",0);

        List<Map<String, Object>> semGpa = new ArrayList<>();
        double totalCredits = 0, totalPoints = 0;

        for (int sem = 1; sem <= student.getCurrentSemester(); sem++) {
            List<Subject> subjects = subjectRepo.findByDepartment_IdAndSemester(
                student.getDepartment().getId(), sem);
            double credits = 0, points = 0;
            for (Subject sub : subjects) {
                Integer mark = semRepo.findByStudent_IdAndSubject_Id(student.getId(), sub.getId())
                    .map(SemesterMarks::getMarksObtained).orElse(null);
                if (mark == null) continue;
                String grade = computeGrade(mark);
                int g = gp.getOrDefault(grade, 0);
                credits += sub.getCredits();
                points  += g * sub.getCredits();
            }
            double gpa = credits > 0 ? Math.round((points / credits) * 100.0) / 100.0 : 0;
            semGpa.add(Map.of("semester", sem, "gpa", gpa));
            totalCredits += credits; totalPoints += points;
        }

        double cgpa = totalCredits > 0
            ? Math.round((totalPoints / totalCredits) * 100.0) / 100.0 : 0;

        return Map.of("semesterGpa", semGpa, "cgpa", cgpa);
    }

    // ── Helpers ───────────────────────────────────────────────────
    private int computeBest2(int c1, int c2, int c3) {
        int[] v = {c1, c2, c3};
        Arrays.sort(v);
        return v[2] + v[1];
    }

    private String computeGrade(int marks) {
        if (marks >= 90) return "O";
        if (marks >= 80) return "A+";
        if (marks >= 70) return "A";
        if (marks >= 60) return "B+";
        if (marks >= 50) return "B";
        return "F";
    }
}
