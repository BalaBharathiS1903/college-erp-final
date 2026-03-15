package com.erp.service;

import com.erp.model.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FeeService {

    @Autowired private FeeAllocationRepository allocRepo;
    @Autowired private FeePaymentRepository    payRepo;
    @Autowired private FeeCategoryRepository   catRepo;
    @Autowired private StudentRepository       studentRepo;

    // ── Student: get all fee allocations + payment status ─────────
    public List<Map<String, Object>> getStudentFees(String username, String year) {
        Student student = studentRepo.findByUser_Username(username)
            .orElseThrow(() -> new RuntimeException("Student not found"));

        List<FeeAllocation> allocs = (year != null && !year.isBlank())
            ? allocRepo.findByStudent_IdAndAcademicYear(student.getId(), year)
            : allocRepo.findByStudent_Id(student.getId());

        return allocs.stream().map(a -> {
            List<FeePayment> payments = payRepo.findByAllocation_Id(a.getId());
            double paid = payments.stream().mapToDouble(FeePayment::getAmountPaid).sum();
            FeePayment latest = payments.stream()
                .max(Comparator.comparing(FeePayment::getPaymentDate)).orElse(null);

            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",           a.getId());
            m.put("feeType",      a.getFeeCategory().getName());
            m.put("allocated",    a.getAmountAllocated());
            m.put("paid",         paid);
            m.put("balance",      a.getAmountAllocated() - paid);
            m.put("year",         a.getAcademicYear());
            m.put("status",       paid >= a.getAmountAllocated() ? "PAID" : paid > 0 ? "PARTIAL" : "PENDING");
            m.put("receiptNo",    latest != null ? latest.getReceiptNo()                        : null);
            m.put("paymentDate",  latest != null ? latest.getPaymentDate().toString()           : null);
            m.put("paymentMode",  latest != null ? latest.getPaymentMode().name()               : null);
            return m;
        }).collect(Collectors.toList());
    }

    // ── Student: fee totals ────────────────────────────────────────
    public Map<String, Object> getStudentFeeSummary(String username, String year) {
        Student student = studentRepo.findByUser_Username(username)
            .orElseThrow(() -> new RuntimeException("Student not found"));
        String yr = (year == null || year.isBlank()) ? currentYear() : year;

        Double allocated = allocRepo.sumAllocated(student.getId(), yr);
        Double paid      = payRepo.sumPaidByStudentAndYear(student.getId(), yr);
        allocated = allocated == null ? 0 : allocated;
        paid      = paid      == null ? 0 : paid;

        return Map.of(
            "year",      yr,
            "allocated", allocated,
            "paid",      paid,
            "balance",   allocated - paid,
            "progress",  allocated > 0 ? Math.round((paid / allocated) * 100) : 0
        );
    }

    // ── Process a payment ─────────────────────────────────────────
    @Transactional
    public Map<String, Object> processPayment(String username, Long allocationId,
            double amount, String paymentMode, String transactionId) {

        Student student = studentRepo.findByUser_Username(username)
            .orElseThrow(() -> new RuntimeException("Student not found"));
        FeeAllocation alloc = allocRepo.findById(allocationId)
            .orElseThrow(() -> new RuntimeException("Fee allocation not found"));

        if (!alloc.getStudent().getId().equals(student.getId()))
            throw new IllegalArgumentException("Allocation does not belong to this student");

        double alreadyPaid = payRepo.findByAllocation_Id(allocationId)
            .stream().mapToDouble(FeePayment::getAmountPaid).sum();
        double remaining = alloc.getAmountAllocated() - alreadyPaid;

        if (remaining <= 0) throw new IllegalStateException("Fee is already fully paid");

        double toPay = Math.min(amount, remaining);
        String receiptNo = "RCP" + System.currentTimeMillis();

        FeePayment payment = FeePayment.builder()
            .allocation(alloc)
            .amountPaid(toPay)
            .paymentDate(LocalDate.now())
            .receiptNo(receiptNo)
            .paymentMode(FeePayment.PaymentMode.valueOf(paymentMode.toUpperCase()))
            .transactionId(transactionId)
            .build();
        payRepo.save(payment);

        return Map.of(
            "receiptNo",   receiptNo,
            "paymentDate", payment.getPaymentDate().toString(),
            "amountPaid",  toPay,
            "status",      "SUCCESS"
        );
    }

    // ── Admin: all allocations ────────────────────────────────────
    public List<Map<String, Object>> getAllAllocations(String year) {
        List<FeeAllocation> allocs = (year != null && !year.isBlank())
            ? allocRepo.findByAcademicYear(year)
            : allocRepo.findAll();

        return allocs.stream().map(a -> {
            double paid = payRepo.findByAllocation_Id(a.getId())
                .stream().mapToDouble(FeePayment::getAmountPaid).sum();
            return Map.<String, Object>of(
                "id",          a.getId(),
                "studentName", a.getStudent().getName(),
                "registerNo",  a.getStudent().getRegisterNo(),
                "feeType",     a.getFeeCategory().getName(),
                "allocated",   a.getAmountAllocated(),
                "paid",        paid,
                "balance",     a.getAmountAllocated() - paid,
                "year",        a.getAcademicYear(),
                "status",      paid >= a.getAmountAllocated() ? "PAID" : "PENDING"
            );
        }).collect(Collectors.toList());
    }

    // ── Admin: allocate fee to a student ─────────────────────────
    @Transactional
    public FeeAllocation allocateFee(Long studentId, Long categoryId,
            double amount, String academicYear) {
        Student     s = studentRepo.findById(studentId).orElseThrow();
        FeeCategory c = catRepo.findById(categoryId).orElseThrow();
        return allocRepo.save(FeeAllocation.builder()
            .student(s).feeCategory(c)
            .amountAllocated(amount).academicYear(academicYear).build());
    }

    private String currentYear() {
        int year = LocalDate.now().getYear();
        return year + "-" + (year + 1 - 2000);
    }

    // ── Receipts ──────────────────────────────────────────────────
    public Object getReceiptById(Long receiptId, String username) {
        return payRepo.findById(receiptId).orElse(null);
    }

    public List<Object> getStudentReceipts(String username) {
        Student student = studentRepo.findByUser_Username(username).orElseThrow();
        // Return dummy empty list for compilation
        return List.of();
    }
}
