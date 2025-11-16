package com.juan.pltc.controller.auth;

import com.juan.pltc.config.jwt.JwtUtil;
import com.juan.pltc.core.entity.user.User;
import com.juan.pltc.service.auth.KakaoAuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth/kakao")
public class AuthController {

    private final KakaoAuthService kakaoAuthService;
    private final JwtUtil jwtUtil;

    @Value("${app.kakao.rest-key}")
    private String kakaoRestKey;

    @Value("${app.kakao.redirect-uri}")
    private String kakaoRedirectUri;


    public record KakaoLoginRequest(String code) {}
    public record KakaoLoginResponse(Long userId, String nickname) {}

    public record MeResponse(Long userId, String nickname, String role) {}

    @GetMapping("/login-url")
    public Map<String, String> kakaoLoginUrl() {
        String url = UriComponentsBuilder
                .fromHttpUrl("https://kauth.kakao.com/oauth/authorize")
                .queryParam("client_id", kakaoRestKey)
                .queryParam("redirect_uri", kakaoRedirectUri)
                .queryParam("response_type", "code")
                .build(true)
                .toUriString();

        return Map.of("url", url);
    }

    @GetMapping("/me")
    public ResponseEntity me(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(new MeResponse(user.getId(), user.getNickname(), user.getRole()));
    }

    @GetMapping("/callback")
    public void kakaoCallback(@RequestParam("code") String code, HttpServletResponse response) throws IOException {
        User user = kakaoAuthService.loginWithKakaoCode(code);

        String jwt = jwtUtil.generateAccessToken(user.getId(), user.getRole());

        ResponseCookie cookie = ResponseCookie.from("AUTH", jwt)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(60L*60L*24L*3L)
                .sameSite("Lax")
                .build();

        response.addHeader("Set-Cookie", cookie.toString());

        response.sendRedirect("/");
    }

    @PostMapping
    public KakaoLoginResponse kakaoLogin(@RequestBody KakaoLoginRequest request) {
        User user = kakaoAuthService.loginWithKakaoCode(request.code());
        return new KakaoLoginResponse(user.getId(), user.getNickname());
    }
}
