package com.juan.pltc.controller.prayfor.dto.response;

import com.juan.pltc.core.entity.prayfor.Prayfor;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class PrayforResponse {
    private String username;
    private String content;

    public static PrayforResponse of(Prayfor prayfor) {
        return PrayforResponse.builder()
                .username(prayfor.getUser() != null ? prayfor.getUser().getNickname() : "ALL")
                .content(prayfor.getContent())
                .build();
    }
}
