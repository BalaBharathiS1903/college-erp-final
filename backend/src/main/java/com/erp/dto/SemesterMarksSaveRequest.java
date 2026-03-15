package com.erp.dto;
import lombok.Data;
import java.util.List;
@Data
public class SemesterMarksSaveRequest {
    private Long subjectId;
    private int semester;
    private List<MarkRecord> records;
    @Data
    public static class MarkRecord {
        private Long studentId;
        private int marks;
    }
}
