package com.erp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="fee_categories")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FeeCategory {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, unique=true, length=80)
    private String name;

    @Column(length=200)
    private String description;
}
