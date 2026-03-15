package com.erp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="fee_allocations",
    uniqueConstraints=@UniqueConstraint(columnNames={"student_id","fee_category_id","academic_year"}))
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FeeAllocation {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name="student_id", nullable=false)
    private Student student;

    @ManyToOne @JoinColumn(name="fee_category_id", nullable=false)
    private FeeCategory feeCategory;

    @Column(name="academic_year", nullable=false, length=10)
    private String academicYear;

    @Column(name="amount_allocated", nullable=false)
    private double amountAllocated;
}
