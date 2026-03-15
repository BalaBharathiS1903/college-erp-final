package com.erp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name="users")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, unique=true, length=50)
    private String username;

    @Column(name="password", nullable=false)
    private String passwordHash;

    @Column(length=100)
    private String name;

    @Column(unique=true, length=150)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false, length=10)
    private Role role;

    @Column(name="is_active", nullable=false)
    private boolean active = true;

    @Column(name="created_at", updatable=false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() { this.createdAt = LocalDateTime.now(); }

    public enum Role { ADMIN, STAFF, STUDENT }
}
