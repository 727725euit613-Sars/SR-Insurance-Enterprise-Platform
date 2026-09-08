package com.insurance.service;

import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.insurance.dto.UserDto;
import com.insurance.entity.User;
import com.insurance.exception.ResourceNotFoundException;
import com.insurance.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        Long userId = Objects.requireNonNull(id, "User id must not be null");
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    public User createUser(UserDto dto) {
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(dto.getRole());
        return userRepository.save(user);
    }

    public User updateUser(Long id, UserDto dto) {
        User existing = getUserById(id);
        existing.setUsername(dto.getUsername());
        existing.setEmail(dto.getEmail());
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        existing.setRole(dto.getRole());
        return userRepository.save(existing);
    }

    public void deleteUser(Long id) {
        User existing = getUserById(id);
        userRepository.delete(Objects.requireNonNull(existing, "User must not be null"));
    }

    public List<User> searchUsersByRole(String role) {
        if (role == null || role.isBlank()) {
            return userRepository.findAll();
        }
        return userRepository.findByRoleContainingIgnoreCase(role);
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
    }
}
