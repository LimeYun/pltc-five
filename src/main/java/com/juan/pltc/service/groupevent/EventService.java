package com.juan.pltc.service.groupevent;

import com.juan.pltc.controller.groupevent.dto.response.RandomRepeatBibleResponse;
import com.juan.pltc.controller.groupevent.dto.response.RandomUserResponse;
import com.juan.pltc.core.entity.groupevent.RepeatBible;
import com.juan.pltc.core.entity.user.User;
import com.juan.pltc.core.repository.groupevent.RepeatBibleRepository;
import com.juan.pltc.core.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Transactional
public class EventService {

    private final UserRepository userRepository;
    private final RepeatBibleRepository repeatBibleRepository;

    public RandomUserResponse startPrayer() {
        User user = pickRandomUser();
        return new RandomUserResponse(user.getNickname());
    }

    public RandomUserResponse endPrayer() {
        User user = pickRandomUser();
        return new RandomUserResponse(user.getNickname());
    }

    private User pickRandomUser() {
        List<User> users = userRepository.findAll();
        int idx = new Random().nextInt(users.size());
        return users.get(idx);
    }

    public RandomRepeatBibleResponse repeatBible() {
        List<RepeatBible> repeatBibles = repeatBibleRepository.findAll();
        int idx = new Random().nextInt(repeatBibles.size());
        RepeatBible repeatBible = repeatBibles.get(idx);
        return new RandomRepeatBibleResponse(repeatBible.getTitle(), repeatBible.getVerse());
    }
}
