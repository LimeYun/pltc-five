package com.juan.pltc.core.repository.bible;

import com.juan.pltc.core.entity.bible.BibleVerse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BibleVerseRepository extends JpaRepository<BibleVerse, Long> {
    List<BibleVerse> findAllByParentNoOrderByVerseNo(Long id);
}
