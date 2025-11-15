package com.juan.pltc.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Service;

@Configuration
@ConfigurationProperties(prefix = "app.kakao")
@Getter
@Setter
public class KakaoProperties {
    private String restKey;
    private String redirectUri;
    private String tokenUri;
    private String userInfoUri;
}
