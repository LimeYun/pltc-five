package com.juan.pltc.core.repository.bible;

import com.juan.pltc.core.entity.bible.Bible;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BibleRepository extends JpaRepository<Bible, Long> {
    @Query("select b from Bible b where :ld between b.startDt and b.endDt")
    List<Bible> findAllByDate(@Param("ld") LocalDate localDate);

    Optional<Bible> findById(Long id);
}
