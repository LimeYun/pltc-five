package com.juan.pltc.controller.bible.dto.response;

import com.juan.pltc.core.entity.bible.Bible;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class BibleResponse {
    private String title;

    public static BibleResponse of(Bible bible) {
        return BibleResponse.builder()
                .title(bible.getTitle())
                .build();
    }
}
