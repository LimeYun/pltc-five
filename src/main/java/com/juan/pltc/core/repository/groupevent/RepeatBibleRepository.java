package com.juan.pltc.core.repository.groupevent;

import com.juan.pltc.core.entity.groupevent.RepeatBible;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepeatBibleRepository extends JpaRepository<RepeatBible, Long> {
}
