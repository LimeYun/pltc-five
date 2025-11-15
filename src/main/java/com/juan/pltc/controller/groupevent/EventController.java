package com.juan.pltc.controller.groupevent;

import com.juan.pltc.controller.groupevent.dto.response.RandomRepeatBibleResponse;
import com.juan.pltc.controller.groupevent.dto.response.RandomUserResponse;
import com.juan.pltc.service.groupevent.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/juan/pltc/event")
public class EventController {

    private final EventService eventService;

    @GetMapping("/start")
    public RandomUserResponse startPrayer() {
        return eventService.startPrayer();
    }

    @GetMapping("/end")
    public RandomUserResponse endPrayer() {
        return eventService.endPrayer();
    }

    @GetMapping("/repeat")
    public RandomRepeatBibleResponse repeatBible() {
        return eventService.repeatBible();
    }
}
