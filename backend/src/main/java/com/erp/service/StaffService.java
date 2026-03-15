package com.erp.service;

import com.erp.model.Staff;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class StaffService {

    @Autowired private StaffRepository       staffRepo;
    @Autowired private AttendanceRepository  attRepo;
    @Autowired private CiaMarksRepository    ciaRepo;
    @Autowired private SubjectRepository     subjectRepo;
    @Autowired private StudentRepository     studentRepo;
    @Autowired private StaffAllocationRepository allocRepo;

    public Map<String, Object> getStaffDashboard(String username) {
        Staff staff = staffRepo.findByUser_Username(username)
            .orElseThrow(() -> new RuntimeException("Staff not found"));

        long subjectCount  = allocRepo.findByStaff_User_Username(username).size();
        long studentCount  = studentRepo.findByDepartment_Id(staff.getDepartment().getId()).size();

        return Map.of(
            "staffName",    staff.getUser().getName(),
            "staffCode",    staff.getStaffCode(),
            "department",   staff.getDepartment().getName(),
            "designation",  staff.getDesignation() == null ? "Lecturer" : staff.getDesignation(),
            "subjectCount", subjectCount,
            "studentCount", studentCount
        );
    }
}
