package com.erp.controller;

import com.erp.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired private UserService userService;
    @Autowired private FeeService  feeService;

    // ── Dashboard ─────────────────────────────────────────────────
    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard() {
        return ResponseEntity.ok(userService.getDashboardStats());
    }

    // ── User management ───────────────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<?> listUsers(
            @RequestParam(required=false) String role,
            @RequestParam(required=false) String search) {
        return ResponseEntity.ok(userService.listUsers(role, search));
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> body) {
        try { return ResponseEntity.ok(userService.createUser(body)); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(Map.of("error",e.getMessage())); }
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<?> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleStatus(id));
    }

    @PatchMapping("/users/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Long id, @RequestBody Map<String,String> body) {
        userService.resetPassword(id, body.get("password"));
        return ResponseEntity.ok(Map.of("message","Password reset successfully"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message","User deleted"));
    }

    // ── Fees management ───────────────────────────────────────────
    @GetMapping("/fees")
    public ResponseEntity<?> allFees(@RequestParam(required=false) String year) {
        return ResponseEntity.ok(feeService.getAllAllocations(year));
    }

    @PostMapping("/fees/allocate")
    public ResponseEntity<?> allocateFee(@RequestBody Map<String, Object> body) {
        Long   studentId = Long.valueOf(body.get("studentId").toString());
        Long   catId     = Long.valueOf(body.get("categoryId").toString());
        double amount    = Double.parseDouble(body.get("amount").toString());
        String year      = body.get("academicYear").toString();
        return ResponseEntity.ok(feeService.allocateFee(studentId, catId, amount, year));
    }
}
