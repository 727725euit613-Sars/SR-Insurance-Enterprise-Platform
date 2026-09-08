package com.insurance.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.insurance.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
    private final byte[] secret;
    private final long expirationMs;
    private final long refreshExpirationMs;

    public JwtService(@Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs,
            @Value("${app.jwt.refresh-expiration-ms:604800000}") long refreshExpirationMs) {
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.expirationMs = expirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    public String generateToken(User user) {
        Date now = new Date();
        return Jwts.builder()
                .subject(user.getUsername())
                .claim("userId", user.getUserId())
                .claim("role", user.getRole())
                .claim("type", "access")
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(Keys.hmacShaKeyFor(secret))
                .compact();
    }

    public String generateRefreshToken(User user) {
        Date now = new Date();
        return Jwts.builder()
                .subject(user.getUsername())
                .claim("type", "refresh")
                .issuedAt(now)
                .expiration(new Date(now.getTime() + refreshExpirationMs))
                .signWith(Keys.hmacShaKeyFor(secret))
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(Keys.hmacShaKeyFor(secret)).build()
                .parseSignedClaims(token).getPayload();
    }

    public Claims parseRefreshToken(String token) {
        Claims claims = parse(token);
        if (!"refresh".equals(claims.get("type", String.class))) {
            throw new IllegalArgumentException("Not a refresh token");
        }
        return claims;
    }
}
