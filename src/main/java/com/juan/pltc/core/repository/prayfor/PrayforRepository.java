package com.juan.pltc.core.repository.prayfor;

import com.juan.pltc.core.entity.prayfor.Prayfor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@Repository
public interface PrayforRepository extends JpaRepository<Prayfor, Long> {
    List<Prayfor> findAll();
    Optional<Prayfor> findById(Long id);
    Optional<Prayfor> findByTargetDate(String targetDate);
}
