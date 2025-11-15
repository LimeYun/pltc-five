package com.juan.pltc.core.entity.prayfor;

import com.juan.pltc.controller.prayfor.dto.request.PrayforUpdateRequest;
import com.juan.pltc.core.entity.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.DayOfWeek;

@Entity
@Table(name = "prayfor")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Setter
public class Prayfor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_date")
    private DayOfWeek targetDate;

    public void update(PrayforUpdateRequest request) {
        this.content = request.getContent();
    }
}
