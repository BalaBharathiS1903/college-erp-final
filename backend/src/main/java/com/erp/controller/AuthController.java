package com.erp.controller;

import com.erp.dto.*;
import com.erp.model.User;
import com.erp.repository.UserRepository;
import com.erp.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired private UserRepository userRepo;
    @Autowired private PasswordEncoder encoder;
    @Autowired private JwtUtil         jwt;

    /** POST /api/auth/login — returns JWT */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        User user = userRepo.findByUsername(req.getUsername())
            .orElse(null);

        if (user == null || !encoder.matches(req.getPassword(), user.getPasswordHash()))
            return ResponseEntity.status(401).body(Map.of("message","Invalid credentials"));

        if (!user.isActive())
            return ResponseEntity.status(403).body(Map.of("message","Account is disabled"));

        // Optional: validate requested role matches stored role
        if (req.getRole() != null && !req.getRole().isBlank()
                && !user.getRole().name().equalsIgnoreCase(req.getRole()))
            return ResponseEntity.status(401).body(Map.of("message","Role mismatch"));

        String token = jwt.generate(user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(new LoginResponse(
            token, user.getRole().name(), user.getUsername(), user.getName()));
    }

    /** GET /api/auth/me — current user info (requires token) */
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();
        return userRepo.findByUsername(auth.getName())
            .map(u -> ResponseEntity.ok(Map.of(
                "username", u.getUsername(),
                "name",     u.getName(),
                "role",     u.getRole().name(),
                "email",    u.getEmail() == null ? "" : u.getEmail()
            )))
            .orElse(ResponseEntity.notFound().build());
    }

    /** POST /api/auth/logout — stateless JWT: client just discards the token */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("message","Logged out successfully"));
    }
}
