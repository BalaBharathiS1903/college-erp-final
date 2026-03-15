package com.erp.repository;
import com.erp.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUser_Username(String username);
    Optional<Student> findByRegisterNo(String registerNo);
    List<Student> findByDepartment_IdAndCurrentSemester(Long deptId, int semester);
    List<Student> findByDepartment_Id(Long deptId);
}
