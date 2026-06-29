package com.ramix.repository;

import com.ramix.model.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    Optional<Playlist> findByName(String name);
}
