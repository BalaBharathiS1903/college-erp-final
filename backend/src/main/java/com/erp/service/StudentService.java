package com.erp.service;

import com.erp.dto.StudentUpdateRequest;
import com.erp.model.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
public class StudentService {

    @Autowired private StudentRepository studentRepo;
    @Autowired private UserRepository    userRepo;
    @Autowired private StaffRepository   staffRepo;

    public Map<String, Object> getStudentDashboard(String username) {
        Student s = studentRepo.findByUser_Username(username)
            .orElseThrow(() -> new RuntimeException("Student not found"));
        return Map.of(
            "name",       s.getName(),
            "regNo",      s.getRegisterNo(),
            "dept",       s.getDepartment().getName(),
            "semester",   s.getCurrentSemester(),
            "batch",      s.getBatch()
        );
    }

    public Map<String, Object> getStudentProfile(String username) {
        Student s = studentRepo.findByUser_Username(username)
            .orElseThrow(() -> new RuntimeException("Student not found"));
        return Map.of(
            "name",       s.getName(),
            "regNo",      s.getRegisterNo(),
            "email",      s.getUser().getEmail() == null ? "" : s.getUser().getEmail(),
            "phone",      s.getPhone() == null ? "" : s.getPhone(),
            "address",    s.getAddress() == null ? "" : s.getAddress(),
            "dept",       s.getDepartment().getName(),
            "semester",   s.getCurrentSemester(),
            "batch",      s.getBatch()
        );
    }

    // Staff view: students in their dept/semester
    public List<Map<String, Object>> getStudentsByStaff(String staffUsername, String search) {
        Staff staff = staffRepo.findByUser_Username(staffUsername)
            .orElseThrow(() -> new RuntimeException("Staff not found"));
        List<Student> all = studentRepo.findByDepartment_Id(staff.getDepartment().getId());
        return all.stream()
            .filter(s -> search == null || search.isBlank()
                || s.getName().toLowerCase().contains(search.toLowerCase())
                || s.getRegisterNo().toLowerCase().contains(search.toLowerCase()))
            .map(this::toMap).toList();
    }

    public Map<String, Object> getStudentDetail(Long id) {
        Student s = studentRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Student not found"));
        return toMap(s);
    }

    @Transactional
    public Map<String, Object> updateBasicDetails(Long id, StudentUpdateRequest req) {
        Student s = studentRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Student not found"));
        if (req.getPhone()   != null) s.setPhone(req.getPhone());
        if (req.getAddress() != null) s.setAddress(req.getAddress());
        if (req.getEmail()   != null) s.getUser().setEmail(req.getEmail());
        return toMap(studentRepo.save(s));
    }

    private Map<String, Object> toMap(Student s) {
        return Map.of(
            "id",       s.getId(),
            "name",     s.getName(),
            "regNo",    s.getRegisterNo(),
            "dept",     s.getDepartment().getName(),
            "semester", s.getCurrentSemester(),
            "batch",    s.getBatch(),
            "phone",    s.getPhone() == null ? "" : s.getPhone()
        );
    }
}
