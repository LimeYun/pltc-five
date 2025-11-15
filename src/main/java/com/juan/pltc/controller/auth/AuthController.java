package com.juan.pltc.controller.auth;

import com.juan.pltc.config.jwt.JwtUtil;
import com.juan.pltc.core.entity.user.User;
import com.juan.pltc.service.auth.KakaoAuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth/kakao")
public class AuthController {

    private final KakaoAuthService kakaoAuthService;
    private final JwtUtil jwtUtil;

    public record KakaoLoginRequest(String code) {}
    public record KakaoLoginResponse(Long userId, String nickname) {}

    public record MeResponse(Long userId, String nickname, String role) {}

    @GetMapping("/me")
    public ResponseEntity me(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(new MeResponse(user.getId(), user.getNickname(), user.getRole()));
    }

    @GetMapping("/callback")
    public KakaoLoginResponse kakaoCallback(@RequestParam("code") String code, HttpServletResponse response) {
        User user = kakaoAuthService.loginWithKakaoCode(code);

        String jwt = jwtUtil.generateAccessToken(user.getId(), user.getRole());

        ResponseCookie cookie = ResponseCookie.from("AUTH", jwt)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(60L*60L*24L*3L)
                .sameSite("Lax")
                .build();

        response.addHeader("Set-Cookie", cookie.toString());

        return new KakaoLoginResponse(user.getId(), user.getNickname());
    }

    @PostMapping
    public KakaoLoginResponse kakaoLogin(@RequestBody KakaoLoginRequest request) {
        User user = kakaoAuthService.loginWithKakaoCode(request.code());
        return new KakaoLoginResponse(user.getId(), user.getNickname());
    }
}
