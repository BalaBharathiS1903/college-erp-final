package com.erp.repository;
import com.erp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    java.util.List<User> findByRole(User.Role role);
    java.util.List<User> findByRoleAndNameContainingIgnoreCase(User.Role role, String name);
    java.util.List<User> findByNameContainingIgnoreCase(String name);
}
