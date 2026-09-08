package com.insurance.controller;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.insurance.dto.AuthResponse;
import com.insurance.dto.LoginRequest;
import com.insurance.dto.RegisterRequest;
import com.insurance.entity.PasswordResetToken;
import com.insurance.entity.User;
import com.insurance.exception.DuplicateResourceException;
import com.insurance.exception.InvalidRequestException;
import com.insurance.exception.ResourceNotFoundException;
import com.insurance.repository.PasswordResetTokenRepository;
import com.insurance.repository.UserRepository;
import com.insurance.security.JwtService;
import com.insurance.service.AuditService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping({"/api/auth", "/api/v1/auth"})
@Tag(name = "Authentication", description = "Login, register, token management, password reset")
@Slf4j
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final AuditService auditService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder,
            JwtService jwtService, PasswordResetTokenRepository resetTokenRepository,
            AuditService auditService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.resetTokenRepository = resetTokenRepository;
        this.auditService = auditService;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and return JWT tokens")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }
        String token = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        auditService.log("LOGIN", "User", user.getUserId(), "User logged in: " + user.getUsername());
        return ResponseEntity.ok(new AuthResponse(token, refreshToken, "Bearer",
                user.getUserId(), user.getUsername(), user.getEmail(), user.getRole()));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user account")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new DuplicateResourceException("Username already taken: " + request.username());
        }
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new DuplicateResourceException("Email already registered: " + request.email());
        }
        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        // Public registration must never allow callers to assign privileged roles.
        user.setRole("CUSTOMER");
        userRepository.save(user);
        String token = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        auditService.log("REGISTER", "User", user.getUserId(), "New user registered: " + user.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(token, refreshToken, "Bearer",
                        user.getUserId(), user.getUsername(), user.getEmail(), user.getRole()));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using refresh token")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        try {
            var claims = jwtService.parseRefreshToken(request.refreshToken());
            String username = claims.getSubject();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new BadCredentialsException("User not found"));
            String newToken = jwtService.generateToken(user);
            String newRefresh = jwtService.generateRefreshToken(user);
            return ResponseEntity.ok(new AuthResponse(newToken, newRefresh, "Bearer",
                    user.getUserId(), user.getUsername(), user.getEmail(), user.getRole()));
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request a password reset token (dev mode: token returned in response)")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        // Always return 200 to prevent email enumeration
        userRepository.findByEmail(request.email()).ifPresent(user -> {
            resetTokenRepository.deleteByEmail(request.email());
            String token = UUID.randomUUID().toString();
            PasswordResetToken prt = new PasswordResetToken();
            prt.setToken(token);
            prt.setEmail(request.email());
            prt.setExpiresAt(LocalDateTime.now().plusMinutes(30));
            prt.setUsed(false);
            resetTokenRepository.save(prt);
            // DEV MODE: log token — in production this would be emailed
            log.info("DEV MODE — Password reset token for {}: {}", request.email(), token);
        });
        return ResponseEntity.ok(new ForgotPasswordResponse(
                "If that email is registered, a reset token has been generated. Check server logs (dev mode)."));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using token from forgot-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        PasswordResetToken prt = resetTokenRepository.findByTokenAndUsedFalse(request.token())
                .orElseThrow(() -> new InvalidRequestException("Invalid or expired reset token"));
        if (prt.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidRequestException("Reset token has expired");
        }
        User user = userRepository.findByEmail(prt.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        prt.setUsed(true);
        resetTokenRepository.save(prt);
        auditService.log("PASSWORD_RESET", "User", user.getUserId(), "Password reset for: " + user.getUsername());
        return ResponseEntity.ok(new MessageResponse("Password reset successfully"));
    }

    public record RefreshRequest(@NotBlank String refreshToken) {}
    public record ForgotPasswordRequest(@NotBlank @Email String email) {}
    public record ForgotPasswordResponse(String message) {}
    public record ResetPasswordRequest(
            @NotBlank String token,
            @NotBlank @Size(min = 8) @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
                    message = "Password must contain uppercase, lowercase, and a digit") String newPassword) {}
    public record MessageResponse(String message) {}
}
