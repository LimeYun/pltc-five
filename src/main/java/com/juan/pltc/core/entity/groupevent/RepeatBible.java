package com.juan.pltc.core.entity.groupevent;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "repeat_bible")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Setter
public class RepeatBible {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String verse;
}
