package com.juan.pltc.service.bible;

import com.juan.pltc.controller.bible.dto.response.BibleResponse;
import com.juan.pltc.controller.bible.dto.response.BibleVerseResponse;
import com.juan.pltc.core.entity.bible.Bible;
import com.juan.pltc.core.entity.bible.BibleVerse;
import com.juan.pltc.core.repository.bible.BibleRepository;
import com.juan.pltc.core.repository.bible.BibleVerseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BibleService {

    private final BibleRepository bibleRepository;
    private final BibleVerseRepository bibleVerseRepository;

    public List<BibleResponse> findBibles(LocalDate localDate) {
        List<Bible> bibles = bibleRepository.findAllByDate(localDate);
        return bibles.stream().map(BibleResponse::of).toList();
    }

    public List<BibleVerseResponse> findBibleVerses(Long id) {
        Bible bible = bibleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 id 입니다."));
        List<BibleVerse> bibleVerses = bibleVerseRepository.findAllByParentNoOrderByVerseNo(id);
        return bibleVerses.stream().map(verse -> BibleVerseResponse.of(bible, verse)).toList();
    }
}
