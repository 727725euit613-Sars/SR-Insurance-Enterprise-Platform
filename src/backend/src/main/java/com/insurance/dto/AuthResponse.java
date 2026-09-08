package com.insurance.dto;

public record AuthResponse(
        String token,
        String refreshToken,
        String tokenType,
        Long userId,
        String username,
        String email,
        String role) {
}
