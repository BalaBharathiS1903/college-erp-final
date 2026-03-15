package com.erp.repository;
import com.erp.model.CiaMarks;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface CiaMarksRepository extends JpaRepository<CiaMarks, Long> {
    List<CiaMarks> findByStudent_Id(Long studentId);
    List<CiaMarks> findBySubject_Id(Long subjectId);
    List<CiaMarks> findBySubject_IdAndCiaNumber(Long subjectId, int ciaNumber);
    Optional<CiaMarks> findByStudent_IdAndSubject_IdAndCiaNumber(Long sid, Long subId, int n);
    List<CiaMarks> findByStudent_IdAndSubject_IdIn(Long studentId, List<Long> subjectIds);

    default List<CiaMarks> findByStudentAndSemester(Long studentId, int semester) {
        return findByStudent_Id(studentId);
    }
}
