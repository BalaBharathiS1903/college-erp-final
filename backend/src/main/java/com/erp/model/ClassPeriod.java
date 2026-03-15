package com.erp.model;

import jakarta.persistence.*;
import lombok.*;

/** One slot in the timetable */
@Entity @Table(name="class_periods")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ClassPeriod {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name="subject_id", nullable=false)
    private Subject subject;

    @ManyToOne @JoinColumn(name="staff_id", nullable=false)
    private Staff staff;

    @Column(name="day_of_week", nullable=false, length=3) // MON..SAT
    private String dayOfWeek;

    @Column(name="period_number", nullable=false)
    private int periodNumber; // 1–6

    @Column(name="semester", nullable=false)
    private int semester;

    @Column(name="academic_year", length=10)
    private String academicYear;
}
