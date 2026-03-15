package com.erp.dto;
import lombok.Data;
import java.util.List;
@Data
public class CiaMarksSaveRequest {
    private Long subjectId;
    private int semester;
    private int ciaNumber;
    private List<MarkRecord> records;
    @Data
    public static class MarkRecord {
        private Long studentId;
        private int marks;
    }
}
