package com.erp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name="fee_payments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FeePayment {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name="allocation_id", nullable=false)
    private FeeAllocation allocation;

    @Column(name="amount_paid", nullable=false)
    private double amountPaid;

    @Column(name="payment_date", nullable=false)
    private LocalDate paymentDate;

    @Column(name="receipt_no", unique=true, nullable=false, length=30)
    private String receiptNo;

    @Enumerated(EnumType.STRING)
    @Column(name="payment_mode", length=10)
    private PaymentMode paymentMode;

    @Column(name="transaction_id", length=100)
    private String transactionId;

    @Column(name="created_at", updatable=false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() { this.createdAt = LocalDateTime.now(); }

    // Convenience accessors used by PdfService
    public Student getStudent()         { return allocation != null ? allocation.getStudent() : null; }
    public FeeCategory getFeeCategory() { return allocation != null ? allocation.getFeeCategory() : null; }
    public String getAcademicYear()     { return allocation != null ? allocation.getAcademicYear() : null; }

    public enum PaymentMode { ONLINE, CASH, CHEQUE, DD }
}
