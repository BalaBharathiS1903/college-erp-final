package com.erp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="subjects")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Subject {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name="department_id", nullable=false)
    private Department department;

    @Column(nullable=false, unique=true, length=20)
    private String code;

    @Column(nullable=false, length=120)
    private String name;

    @Column(nullable=false)
    private int semester;

    @Column(nullable=false)
    private int credits = 3;

    @Column(name="subject_type", length=20)
    private String subjectType = "THEORY"; // THEORY / LAB / ELECTIVE
}
