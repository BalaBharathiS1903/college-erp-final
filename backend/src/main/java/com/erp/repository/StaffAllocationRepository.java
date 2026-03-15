package com.erp.repository;
import com.erp.model.StaffAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface StaffAllocationRepository extends JpaRepository<StaffAllocation, Long> {
    List<StaffAllocation> findByStaff_Id(Long staffId);
    List<StaffAllocation> findBySubject_Id(Long subjectId);
    List<StaffAllocation> findByStaff_User_Username(String username);
    List<StaffAllocation> findByAcademicYear(String year);
}
