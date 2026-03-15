package com.erp.repository;
import com.erp.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByDepartment_IdAndSemester(Long deptId, int semester);
    List<Subject> findByDepartment_Id(Long deptId);
    default List<Subject> findByDeptAndSemester(Long deptId, int sem) {
        return findByDepartment_IdAndSemester(deptId, sem);
    }
}
