package com.juan.pltc.config.jwt;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class JwtUtil {

    private final JwtProperties jwtProperties;

    public String generateAccessToken(Long userId, String role) {
        Algorithm alg = Algorithm.HMAC256(jwtProperties.getSecret());

        Instant now = Instant.now();
        Instant exp = now.plusSeconds(jwtProperties.getAccessTokenExpireSeconds());

        return JWT.create()
                .withSubject(String.valueOf(userId))
                .withClaim("role", role)
                .withIssuedAt(Date.from(now))
                .withExpiresAt(Date.from(exp))
                .sign(alg);
    }

    public Long getUserId(String token) {
        try {
            Algorithm alg = Algorithm.HMAC256(jwtProperties.getSecret());
            String subject = JWT.require(alg).build().verify(token).getSubject();

            return Long.valueOf(subject);
        } catch (JWTVerificationException | NumberFormatException e) {
            return null;
        }
    }
}
