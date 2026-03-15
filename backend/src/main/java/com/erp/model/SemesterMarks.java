package com.erp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name="semester_marks",
    uniqueConstraints=@UniqueConstraint(columnNames={"student_id","subject_id"}))
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SemesterMarks {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name="student_id", nullable=false)
    private Student student;

    @ManyToOne @JoinColumn(name="subject_id", nullable=false)
    private Subject subject;

    @Column(name="marks_obtained", nullable=false)
    private int marksObtained; // 0–100

    @Column(name="max_marks", nullable=false)
    private int maxMarks = 100;

    @Column(name="entered_by")
    private Long enteredBy;

    @Column(name="entered_at")
    private LocalDateTime enteredAt;

    @PrePersist
    void prePersist() { this.enteredAt = LocalDateTime.now(); }

    public Long getSubjectId() { return subject != null ? subject.getId() : null; }
}
