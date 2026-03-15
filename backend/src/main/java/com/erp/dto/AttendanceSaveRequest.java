package com.erp.dto;
import lombok.Data;
import java.util.List;
@Data
public class AttendanceSaveRequest {
    private Long subjectId;
    private String date;
    private List<AttendanceRecord> records;
    @Data
    public static class AttendanceRecord {
        private Long studentId;
        private int periodId;
        private String status;
    }
}
