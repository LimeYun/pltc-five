package com.juan.pltc.service.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.juan.pltc.config.KakaoProperties;
import com.juan.pltc.core.entity.user.User;
import com.juan.pltc.core.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class KakaoAuthService {

    private final KakaoProperties kakaoProperties;
    private final UserRepository userRepository;

    private final RestClient restClient = RestClient.create();

    public record KakaoTokenResponse(
            @JsonProperty("access_token") String accessToken,
            @JsonProperty("refresh_token") String refreshToken,
            @JsonProperty("id_token") String idToken,
            @JsonProperty("token_type") String tokenType,
            @JsonProperty("expires_in") Long expiresIn
    ) {}

    public record KakaoUserResponse(
            Long id,
            Map<String, Object> properties,
            Map<String, Object> kakao_account
    ) {}

    public User loginWithKakaoCode(String code) {
        KakaoTokenResponse token = fetchToken(code);
        KakaoUserResponse kakaoUser = fetchUser(token.accessToken());

        Long kakaoId = kakaoUser.id();
        String nickname = (String) kakaoUser.properties().get("nickname");

        return userRepository.findByKakaoId(kakaoId).orElseGet(() -> userRepository.save(
                User.builder()
                        .kakaoId(kakaoId)
                        .nickname(nickname)
                        .role("USER")
                        .build()
        ));
    }

    private KakaoTokenResponse fetchToken(String code) {
        String body = "grant_type=authorization_code" + "&client_id=" + url(kakaoProperties.getRestKey()) + "&redirect_uri=" + url(kakaoProperties.getRedirectUri()) + "&code=" + url(code);

        return restClient.post()
                .uri(kakaoProperties.getTokenUri())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(body)
                .retrieve()
                .body(KakaoTokenResponse.class);
    }

    private KakaoUserResponse fetchUser(String accessToken) {
        return restClient.get()
                .uri(kakaoProperties.getUserInfoUri())
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(KakaoUserResponse.class);
    }

    private String url(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }
}
