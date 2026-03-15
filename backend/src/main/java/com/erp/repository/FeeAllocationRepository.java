package com.erp.repository;
import com.erp.model.FeeAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
public interface FeeAllocationRepository extends JpaRepository<FeeAllocation, Long> {
    List<FeeAllocation> findByStudent_Id(Long studentId);
    List<FeeAllocation> findByStudent_IdAndAcademicYear(Long studentId, String year);
    List<FeeAllocation> findByAcademicYear(String year);

    @Query("SELECT SUM(f.amountAllocated) FROM FeeAllocation f WHERE f.student.id=:sid AND f.academicYear=:yr")
    Double sumAllocated(Long sid, String yr);
}
