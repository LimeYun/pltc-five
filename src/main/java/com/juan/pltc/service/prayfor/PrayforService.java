package com.juan.pltc.service.prayfor;

import com.juan.pltc.controller.prayfor.dto.request.PrayforUpdateRequest;
import com.juan.pltc.controller.prayfor.dto.response.PrayforResponse;
import com.juan.pltc.core.entity.prayfor.Prayfor;
import com.juan.pltc.core.repository.prayfor.PrayforRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PrayforService {

    private final PrayforRepository prayforRepository;

    public List<PrayforResponse> findPrayfors() {
        List<Prayfor> prayfors = prayforRepository.findAll();
        return prayfors.stream().map(PrayforResponse::of).toList();
    }

    public PrayforResponse findPrayforById(Long id) {
        Prayfor prayfor = prayforRepository.findById(id).orElseThrow();
        return PrayforResponse.of(prayfor);
    }

    public PrayforResponse findTodayPrayfor() {
        String today = LocalDate.now().getDayOfWeek().name();
        if(today.equals("SATURDAY") || today.equals("SUNDAY")) {
            return PrayforResponse.builder()
                    .username("ALL")
                    .content("오늘은 모두를 위해 한 번씩 기도하는 날입니다.")
                    .build();
        }

        Prayfor todayPrayfor = prayforRepository.findByTargetDate(today)
                .orElseThrow();
        return PrayforResponse.of(todayPrayfor);
    }

    public void updatePrayfor(Long id, PrayforUpdateRequest request) {
        Prayfor prayfor = prayforRepository.findById(id).orElseThrow();
        prayfor.update(request);
    }
}
