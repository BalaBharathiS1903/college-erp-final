package com.erp.model;

import jakarta.persistence.*;
import lombok.*;

/** Links a staff member to a subject they teach */
@Entity @Table(name="staff_allocations",
    uniqueConstraints=@UniqueConstraint(columnNames={"subject_id","academic_year"}))
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class StaffAllocation {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name="staff_id", nullable=false)
    private Staff staff;

    @ManyToOne @JoinColumn(name="subject_id", nullable=false)
    private Subject subject;

    @Column(name="academic_year", nullable=false, length=10)
    private String academicYear;
}
