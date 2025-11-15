package com.juan.pltc.controller.bible.dto.response;

import com.juan.pltc.core.entity.bible.Bible;
import com.juan.pltc.core.entity.bible.BibleVerse;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class BibleVerseResponse {
    private String title;
    private int verseNo;
    private String content;

    public static BibleVerseResponse of(Bible bible, BibleVerse bibleVerse) {
        return BibleVerseResponse.builder()
                .title(bible.getTitle())
                .verseNo(bibleVerse.getVerseNo())
                .content(bibleVerse.getContent())
                .build();
    }
}
