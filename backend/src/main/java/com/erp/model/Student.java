package com.erp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity @Table(name="students")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Student {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @OneToOne @JoinColumn(name="user_id", nullable=false)
    private User user;

    @ManyToOne @JoinColumn(name="department_id", nullable=false)
    private Department department;

    @Column(name="register_no", unique=true, nullable=false, length=20)
    private String registerNo;

    @Column(nullable=false, length=30)
    private String batch;

    @Column(name="current_semester", nullable=false)
    private int currentSemester = 1;

    @Column(name="date_of_birth")
    private LocalDate dateOfBirth;

    @Column(length=20)
    private String phone;

    @Column(length=200)
    private String address;

    // Convenience getter
    public String getName()     { return user != null ? user.getName() : ""; }
    public String getUsername() { return user != null ? user.getUsername() : ""; }
}
