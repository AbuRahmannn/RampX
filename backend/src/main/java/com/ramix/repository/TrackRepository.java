package com.ramix.repository;

import com.ramix.model.Track;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TrackRepository extends JpaRepository<Track, Long> {
    Optional<Track> findByTrackId(String trackId);
}
