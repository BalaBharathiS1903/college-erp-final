package com.erp.repository;
import com.erp.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudent_IdAndSubject_Id(Long studentId, Long subjectId);
    List<Attendance> findBySubject_IdAndDate(Long subjectId, LocalDate date);
    List<Attendance> findByStudent_Id(Long studentId);

    Optional<Attendance> findByStudent_IdAndSubject_IdAndDateAndPeriodNumber(
        Long studentId, Long subjectId, LocalDate date, int periodNumber);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id=:sid AND a.subject.id=:subId")
    long countTotal(Long sid, Long subId);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id=:sid AND a.subject.id=:subId AND a.status IN ('P','OD')")
    long countPresent(Long sid, Long subId);
}
