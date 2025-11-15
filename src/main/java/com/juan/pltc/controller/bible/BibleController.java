package com.juan.pltc.controller.bible;

import com.juan.pltc.controller.bible.dto.response.BibleResponse;
import com.juan.pltc.controller.bible.dto.response.BibleVerseResponse;
import com.juan.pltc.service.bible.BibleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/juan/pltc/bible")
public class BibleController {

    private final BibleService bibleService;

    @GetMapping
    public List<BibleResponse> findBibles() {
        return bibleService.findBibles(LocalDate.now());
    }

    @GetMapping("/{id}")
    public List<BibleVerseResponse> findBibleVerses(@PathVariable Long id) {
        return bibleService.findBibleVerses(id);
    }
}
