package com.erp.service;

import com.erp.model.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class UserService {

    @Autowired private UserRepository    userRepo;
    @Autowired private StaffRepository   staffRepo;
    @Autowired private StudentRepository studentRepo;
    @Autowired private DepartmentRepository deptRepo;
    @Autowired private PasswordEncoder   encoder;

    // ── List all users with optional role + search filter ─────────
    public List<Map<String, Object>> listUsers(String role, String search) {
        List<User> users;
        if (role != null && !role.isBlank()) {
            User.Role r = User.Role.valueOf(role.toUpperCase());
            users = (search != null && !search.isBlank())
                ? userRepo.findByRoleAndNameContainingIgnoreCase(r, search)
                : userRepo.findByRole(r);
        } else {
            users = (search != null && !search.isBlank())
                ? userRepo.findByNameContainingIgnoreCase(search)
                : userRepo.findAll();
        }
        return users.stream().map(this::toMap).toList();
    }

    // ── Create user + Staff or Student record ─────────────────────
    @Transactional
    public Map<String, Object> createUser(Map<String, Object> body) {
        String username = body.get("username").toString();
        if (userRepo.existsByUsername(username))
            throw new IllegalArgumentException("Username already exists");

        User.Role role = User.Role.valueOf(body.get("role").toString().toUpperCase());

        User user = User.builder()
            .username(username)
            .name(body.get("name").toString())
            .email(body.getOrDefault("email", "").toString())
            .passwordHash(encoder.encode(body.get("password").toString()))
            .role(role).active(true).build();
        user = userRepo.save(user);

        Long deptId = body.get("departmentId") != null
            ? Long.valueOf(body.get("departmentId").toString()) : null;
        Department dept = deptId != null
            ? deptRepo.findById(deptId).orElse(null) : null;

        if (role == User.Role.STAFF && dept != null) {
            staffRepo.save(Staff.builder()
                .user(user).department(dept)
                .staffCode("STF" + String.format("%03d", user.getId()))
                .designation(body.getOrDefault("designation","Lecturer").toString())
                .build());
        } else if (role == User.Role.STUDENT && dept != null) {
            studentRepo.save(Student.builder()
                .user(user).department(dept)
                .registerNo(body.getOrDefault("registerNo","").toString())
                .batch(body.getOrDefault("batch","").toString())
                .currentSemester(1)
                .build());
        }
        return toMap(user);
    }

    // ── Toggle active status ──────────────────────────────────────
    @Transactional
    public Map<String, Object> toggleStatus(Long id) {
        User user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(!user.isActive());
        return toMap(userRepo.save(user));
    }

    // ── Reset password ────────────────────────────────────────────
    @Transactional
    public void resetPassword(Long id, String newPassword) {
        User user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setPasswordHash(encoder.encode(newPassword));
        userRepo.save(user);
    }

    // ── Delete user ───────────────────────────────────────────────
    @Transactional
    public void deleteUser(Long id) {
        userRepo.deleteById(id);
    }

    // ── Dashboard stats ───────────────────────────────────────────
    public Map<String, Object> getDashboardStats() {
        long students = userRepo.findByRole(User.Role.STUDENT).size();
        long staff    = userRepo.findByRole(User.Role.STAFF).size();
        return Map.of("totalStudents", students, "totalStaff", staff);
    }

    // ── Helpers ───────────────────────────────────────────────────
    private Map<String, Object> toMap(User u) {
        return Map.of(
            "id",       u.getId(),
            "username", u.getUsername(),
            "name",     u.getName(),
            "email",    u.getEmail() == null ? "" : u.getEmail(),
            "role",     u.getRole().name(),
            "active",   u.isActive()
        );
    }
}
