package com.erp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="departments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Department {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, unique=true, length=100)
    private String name;

    @Column(length=10)
    private String code;

    @Column(name="hod_name", length=100)
    private String hodName;
}
