package com.erp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/** CIA marks: one row per student × subject × CIA number */
@Entity @Table(name="cia_marks",
    uniqueConstraints=@UniqueConstraint(columnNames={"student_id","subject_id","cia_number"}))
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CiaMarks {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name="student_id", nullable=false)
    private Student student;

    @ManyToOne @JoinColumn(name="subject_id", nullable=false)
    private Subject subject;

    @Column(name="cia_number", nullable=false)
    private int ciaNumber; // 1, 2, or 3

    @Column(name="marks_obtained", nullable=false)
    private int marksObtained; // 0–50

    @Column(name="max_marks", nullable=false)
    private int maxMarks = 50;

    @Column(name="entered_by")
    private Long enteredBy; // staff user id

    @Column(name="entered_at")
    private LocalDateTime enteredAt;

    @PrePersist
    void prePersist() { this.enteredAt = LocalDateTime.now(); }

    // Convenience
    public Long getSubjectId() { return subject != null ? subject.getId() : null; }
}
