package com.juan.pltc.controller.bible.dto.response;

import com.juan.pltc.core.entity.bible.Bible;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class BibleResponse {
    private Long id;
    private String title;

    public static BibleResponse of(Bible bible) {
        return BibleResponse.builder()
                .id(bible.getId())
                .title(bible.getTitle())
                .build();
    }
}
