package com.erp.config;

import com.erp.model.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired private UserRepository userRepo;
    @Autowired private StaffRepository staffRepo;
    @Autowired private StudentRepository studentRepo;
    @Autowired private DepartmentRepository deptRepo;
    @Autowired private PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        Department cse = deptRepo.findByCode("CSE").orElse(null);
        Department ece = deptRepo.findByCode("ECE").orElse(null);

        // ── Admin ────────────────────────────────────────────
        if (userRepo.findByUsername("admin").isEmpty()) {
            userRepo.save(User.builder()
                .username("admin")
                .passwordHash(encoder.encode("admin@123"))
                .name("Administrator")
                .email("admin@college.edu")
                .role(User.Role.ADMIN)
                .active(true)
                .build());
            System.out.println("✅ Created admin  →  admin / admin@123");
        }

        // ── Staff 1: Dr. Ramesh Kumar (CSE) ──────────────────
        if (userRepo.findByUsername("ramesh.k").isEmpty() && cse != null) {
            User u = userRepo.save(User.builder()
                .username("ramesh.k")
                .passwordHash(encoder.encode("staff@123"))
                .name("Dr. Ramesh Kumar")
                .email("ramesh@college.edu")
                .role(User.Role.STAFF)
                .active(true)
                .build());
            staffRepo.save(Staff.builder()
                .user(u).department(cse)
                .staffCode("STF001")
                .designation("Professor")
                .phone("9876543210")
                .build());
            System.out.println("✅ Created staff  →  ramesh.k / staff@123");
        }

        // ── Staff 2: Prof. Meena Devi (ECE) ──────────────────
        if (userRepo.findByUsername("meena.d").isEmpty() && ece != null) {
            User u = userRepo.save(User.builder()
                .username("meena.d")
                .passwordHash(encoder.encode("staff@123"))
                .name("Prof. Meena Devi")
                .email("meena@college.edu")
                .role(User.Role.STAFF)
                .active(true)
                .build());
            staffRepo.save(Staff.builder()
                .user(u).department(ece)
                .staffCode("STF002")
                .designation("Asst. Professor")
                .phone("9876543211")
                .build());
            System.out.println("✅ Created staff  →  meena.d / staff@123");
        }

        // ── Student 1: Arjun Selvan (CSE, Sem 6) ─────────────
        if (userRepo.findByUsername("21CSE001").isEmpty() && cse != null) {
            User u = userRepo.save(User.builder()
                .username("21CSE001")
                .passwordHash(encoder.encode("student@123"))
                .name("Arjun Selvan")
                .email("arjun@student.edu")
                .role(User.Role.STUDENT)
                .active(true)
                .build());
            studentRepo.save(Student.builder()
                .user(u).department(cse)
                .registerNo("21CSE001")
                .batch("2021-2025")
                .currentSemester(6)
                .phone("9123456780")
                .build());
            System.out.println("✅ Created student →  21CSE001 / student@123");
        }

        // ── Student 2: Priya Lakshmi (CSE, Sem 6) ────────────
        if (userRepo.findByUsername("21CSE002").isEmpty() && cse != null) {
            User u = userRepo.save(User.builder()
                .username("21CSE002")
                .passwordHash(encoder.encode("student@123"))
                .name("Priya Lakshmi")
                .email("priya@student.edu")
                .role(User.Role.STUDENT)
                .active(true)
                .build());
            studentRepo.save(Student.builder()
                .user(u).department(cse)
                .registerNo("21CSE002")
                .batch("2021-2025")
                .currentSemester(6)
                .phone("9123456781")
                .build());
            System.out.println("✅ Created student →  21CSE002 / student@123");
        }

        System.out.println("\n📋 All login credentials:");
        System.out.println("   ADMIN   →  admin    / admin@123");
        System.out.println("   STAFF   →  ramesh.k / staff@123   (or meena.d / staff@123)");
        System.out.println("   STUDENT →  21CSE001 / student@123 (or 21CSE002 / student@123)");
    }
}
