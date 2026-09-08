package com.insurance.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.insurance.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    List<User> findByRoleContainingIgnoreCase(String role);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);
}
