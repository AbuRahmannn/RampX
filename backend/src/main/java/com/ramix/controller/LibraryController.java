package com.ramix.controller;

import com.ramix.model.Playlist;
import com.ramix.model.Track;
import com.ramix.model.UserHistory;
import com.ramix.repository.PlaylistRepository;
import com.ramix.repository.TrackRepository;
import com.ramix.repository.UserHistoryRepository;
import com.ramix.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/library")
@CrossOrigin(origins = "*")
public class LibraryController {

    private final UserHistoryRepository historyRepository;
    private final PlaylistRepository playlistRepository;
    private final TrackRepository trackRepository;
    private final RecommendationService recommendationService;

    public LibraryController(UserHistoryRepository historyRepository, 
                             PlaylistRepository playlistRepository, 
                             TrackRepository trackRepository, 
                             RecommendationService recommendationService) {
        this.historyRepository = historyRepository;
        this.playlistRepository = playlistRepository;
        this.trackRepository = trackRepository;
        this.recommendationService = recommendationService;
    }

    // --- History Endpoints ---

    @GetMapping("/history")
    public List<UserHistory> getHistory() {
        return historyRepository.findByPlayedAtIsNotNullOrderByPlayedAtDesc();
    }

    @DeleteMapping("/history")
    public ResponseEntity<?> clearHistory() {
        List<UserHistory> history = historyRepository.findAll();
        for (UserHistory item : history) {
            if (item.isLiked()) {
                item.setPlayCount(0);
                item.setPlayedAt(null);
                historyRepository.save(item);
            } else {
                historyRepository.delete(item);
            }
        }
        return ResponseEntity.ok(Map.of("message", "History cleared successfully"));
    }

    @PostMapping("/history/log")
    public ResponseEntity<?> logPlay(@RequestBody Map<String, String> body) {
        String trackId = body.get("trackId");
        String title = body.get("title");
        String artist = body.get("artist");
        String album = body.get("album");
        String coverArt = body.get("coverArt");
        String genre = body.get("genre");

        if (trackId == null || trackId.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "trackId is required"));
        }

        Optional<UserHistory> existing = historyRepository.findByTrackId(trackId);
        UserHistory historyItem;
        if (existing.isPresent()) {
            historyItem = existing.get();
            historyItem.incrementPlayCount();
        } else {
            historyItem = new UserHistory(trackId, title, artist, album, coverArt, genre);
        }
        
        // Save history item
        historyRepository.save(historyItem);
        return ResponseEntity.ok(historyItem);
    }

    // --- Favorites Endpoints ---

    @GetMapping("/favorites")
    public List<UserHistory> getFavorites() {
        return historyRepository.findByLikedTrue();
    }

    @PostMapping("/favorites/toggle")
    public ResponseEntity<?> toggleFavorite(@RequestBody Map<String, Object> body) {
        String trackId = (String) body.get("trackId");
        if (trackId == null || trackId.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "trackId is required"));
        }

        Optional<UserHistory> existingOpt = historyRepository.findByTrackId(trackId);
        UserHistory historyItem;
        if (existingOpt.isPresent()) {
            historyItem = existingOpt.get();
            historyItem.setLiked(!historyItem.isLiked());
        } else {
            // If not played yet, register play and like it
            String title = (String) body.get("title");
            String artist = (String) body.get("artist");
            String album = (String) body.get("album");
            String coverArt = (String) body.get("coverArt");
            String genre = (String) body.get("genre");
            
            historyItem = new UserHistory(trackId, title, artist, album, coverArt, genre);
            historyItem.setLiked(true);
        }

        historyRepository.save(historyItem);
        return ResponseEntity.ok(Map.of("liked", historyItem.isLiked(), "trackId", trackId));
    }

    // --- Recommendations Endpoints ---

    @GetMapping("/recommendations")
    public List<Track> getRecommendations() {
        return recommendationService.getRecommendations();
    }

    // --- Playlists Endpoints ---

    @GetMapping("/playlists")
    public List<Playlist> getPlaylists() {
        return playlistRepository.findAll();
    }

    @PostMapping("/playlists")
    public ResponseEntity<?> createPlaylist(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Playlist name is required"));
        }
        Playlist playlist = new Playlist(name.trim());
        playlistRepository.save(playlist);
        return ResponseEntity.ok(playlist);
    }

    @DeleteMapping("/playlists/{id}")
    public ResponseEntity<?> deletePlaylist(@PathVariable Long id) {
        if (!playlistRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        playlistRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Playlist deleted successfully"));
    }

    @PostMapping("/playlists/{playlistId}/add")
    public ResponseEntity<?> addTrackToPlaylist(@PathVariable Long playlistId, @RequestBody Map<String, String> body) {
        Optional<Playlist> playlistOpt = playlistRepository.findById(playlistId);
        if (playlistOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Playlist playlist = playlistOpt.get();
        String trackId = body.get("trackId");
        String title = body.get("title");
        String artist = body.get("artist");
        String album = body.get("album");
        String coverArt = body.get("coverArt");
        String duration = body.get("duration");
        String genre = body.get("genre");

        // Try to find track in Track cache or create it
        Track track = trackRepository.findByTrackId(trackId).orElseGet(() -> {
            Track newTrack = new Track(trackId, title, artist, album, coverArt, duration, genre, null);
            return trackRepository.save(newTrack);
        });

        // Add track to playlist if not already in it
        if (!playlist.getTracks().contains(track)) {
            playlist.getTracks().add(track);
            playlistRepository.save(playlist);
        }

        return ResponseEntity.ok(playlist);
    }

    @PostMapping("/playlists/{playlistId}/remove")
    public ResponseEntity<?> removeTrackFromPlaylist(@PathVariable Long playlistId, @RequestBody Map<String, String> body) {
        Optional<Playlist> playlistOpt = playlistRepository.findById(playlistId);
        if (playlistOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Playlist playlist = playlistOpt.get();
        String trackId = body.get("trackId");

        playlist.getTracks().removeIf(track -> track.getTrackId().equals(trackId));
        playlistRepository.save(playlist);

        return ResponseEntity.ok(playlist);
    }
}
