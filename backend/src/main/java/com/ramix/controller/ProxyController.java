package com.ramix.controller;

import com.ramix.model.Track;
import com.ramix.repository.TrackRepository;
import com.ramix.service.YouTubeSearchService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/proxy")
@CrossOrigin(origins = "*")
public class ProxyController {

    private final YouTubeSearchService youtubeSearchService;
    private final TrackRepository trackRepository;

    public ProxyController(YouTubeSearchService youtubeSearchService, TrackRepository trackRepository) {
        this.youtubeSearchService = youtubeSearchService;
        this.trackRepository = trackRepository;
    }

    @GetMapping("/youtube-search")
    public ResponseEntity<?> searchYoutube(
            @RequestParam String artist,
            @RequestParam String title,
            @RequestParam(required = false) String trackId,
            @RequestParam(required = false) String album,
            @RequestParam(required = false) String coverArt,
            @RequestParam(required = false) String duration,
            @RequestParam(required = false) String genre) {
        
        // 1. Check if track already exists and has a cached YouTube ID
        if (trackId != null && !trackId.isEmpty()) {
            Optional<Track> existing = trackRepository.findByTrackId(trackId);
            if (existing.isPresent() && existing.get().getYoutubeId() != null && !existing.get().getYoutubeId().isEmpty()) {
                return ResponseEntity.ok(Map.of("videoId", existing.get().getYoutubeId()));
            }
        }

        // 2. Perform search scraping if not cached
        String videoId = youtubeSearchService.searchVideoId(artist, title);
        if (videoId == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Could not find a YouTube video match for this track"));
        }

        // 3. Cache the track details in our database
        try {
            Track track = null;
            if (trackId != null && !trackId.isEmpty()) {
                track = trackRepository.findByTrackId(trackId).orElse(new Track());
                track.setTrackId(trackId);
            } else {
                track = new Track();
                track.setTrackId("custom-" + System.currentTimeMillis());
            }
            track.setArtist(artist);
            track.setTitle(title);
            track.setAlbum(album != null ? album : "Single");
            track.setCoverArt(coverArt);
            track.setDuration(duration);
            track.setGenre(genre != null ? genre : "Music");
            track.setYoutubeId(videoId);
            trackRepository.save(track);
        } catch (Exception e) {
            System.err.println("Error caching track: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of("videoId", videoId));
    }
}
