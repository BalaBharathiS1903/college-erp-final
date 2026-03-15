package com.erp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="staff")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Staff {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @OneToOne @JoinColumn(name="user_id", nullable=false)
    private User user;

    @ManyToOne @JoinColumn(name="department_id", nullable=false)
    private Department department;

    @Column(name="staff_code", unique=true, length=20)
    private String staffCode;

    @Column(length=50)
    private String designation;

    @Column(length=20)
    private String phone;
}
