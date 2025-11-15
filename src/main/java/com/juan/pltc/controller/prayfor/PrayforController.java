package com.juan.pltc.controller.prayfor;

import com.juan.pltc.controller.prayfor.dto.request.PrayforUpdateRequest;
import com.juan.pltc.controller.prayfor.dto.response.PrayforResponse;
import com.juan.pltc.core.entity.prayfor.Prayfor;
import com.juan.pltc.service.prayfor.PrayforService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/juan/pltc/pray")
public class PrayforController {

    private final PrayforService prayforService;

    @GetMapping
    public List<PrayforResponse> findPrayfors() {
        return prayforService.findPrayfors();
    }

    @GetMapping("/{id}")
    public PrayforResponse findPrayfor(@PathVariable Long id) {
        return prayforService.findPrayforById(id);
    }

    @GetMapping("/today")
    public PrayforResponse findTodayPrayfor() {
        return prayforService.findTodayPrayfor();
    }

    @PutMapping("/{id}")
    public void updatePrayfor(@PathVariable Long id, @RequestBody PrayforUpdateRequest request) {
        prayforService.updatePrayfor(id, request);
    }
}
