package com.erp.repository;
import com.erp.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface StaffRepository extends JpaRepository<Staff, Long> {
    Optional<Staff> findByUser_Username(String username);
    Optional<Staff> findByUser_Id(Long userId);
    List<Staff> findByDepartment_Id(Long deptId);
}
