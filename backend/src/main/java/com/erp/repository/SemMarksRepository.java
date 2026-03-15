package com.erp.repository;
import com.erp.model.SemesterMarks;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface SemMarksRepository extends JpaRepository<SemesterMarks, Long> {
    List<SemesterMarks> findByStudent_Id(Long studentId);
    List<SemesterMarks> findBySubject_Id(Long subjectId);
    Optional<SemesterMarks> findByStudent_IdAndSubject_Id(Long studentId, Long subjectId);
    List<SemesterMarks> findByStudent_IdAndSubject_IdIn(Long studentId, List<Long> subjectIds);

    default List<SemesterMarks> findByStudentAndSemester(Long studentId, int semester) {
        return findByStudent_Id(studentId);
    }
}
