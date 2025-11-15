package com.juan.pltc.core.entity.bible;

import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Table(name = "bible_verse")
@Getter
public class BibleVerse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "parent_no")
    private Long parentNo;

    @Column(name = "verse_no")
    private Integer verseNo;

    private String content;
}
