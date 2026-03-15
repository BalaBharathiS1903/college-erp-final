package com.erp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

/** Hour-based attendance: one row per student × period × date */
@Entity @Table(name="attendance",
    uniqueConstraints=@UniqueConstraint(columnNames={"student_id","subject_id","date","period_number"}))
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Attendance {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name="student_id", nullable=false)
    private Student student;

    @ManyToOne @JoinColumn(name="subject_id", nullable=false)
    private Subject subject;

    @ManyToOne @JoinColumn(name="staff_id", nullable=false)
    private Staff staff;

    @Column(nullable=false)
    private LocalDate date;

    @Column(name="period_number", nullable=false)
    private int periodNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false, length=5)
    private Status status = Status.A;

    public enum Status { P, A, OD, L }
}
