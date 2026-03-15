package com.erp.repository;
import com.erp.model.FeePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
public interface FeePaymentRepository extends JpaRepository<FeePayment, Long> {
    Optional<FeePayment> findByReceiptNo(String receiptNo);
    List<FeePayment> findByAllocation_Student_Id(Long studentId);
    List<FeePayment> findByAllocation_Id(Long allocationId);

    @Query("SELECT SUM(p.amountPaid) FROM FeePayment p WHERE p.allocation.student.id=:sid AND p.allocation.academicYear=:yr")
    Double sumPaidByStudentAndYear(Long sid, String yr);
}
