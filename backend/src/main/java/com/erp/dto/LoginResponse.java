package com.erp.dto;
import lombok.*;
@Data @AllArgsConstructor
public class LoginResponse {
    private String token;
    private String role;
    private String username;
    private String name;
}
