package com.ramix.repository;

import com.ramix.model.UserHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserHistoryRepository extends JpaRepository<UserHistory, Long> {
    Optional<UserHistory> findByTrackId(String trackId);
    List<UserHistory> findByLikedTrue();
    List<UserHistory> findByPlayedAtIsNotNullOrderByPlayedAtDesc();
}
