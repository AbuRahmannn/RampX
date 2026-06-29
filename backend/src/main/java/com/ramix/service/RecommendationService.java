package com.ramix.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ramix.model.Track;
import com.ramix.model.UserHistory;
import com.ramix.repository.UserHistoryRepository;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final UserHistoryRepository historyRepository;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public RecommendationService(UserHistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(6))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public List<Track> getRecommendations() {
        List<UserHistory> history = historyRepository.findAll();
        
        // Cold start check: If no history, fetch default trending tracks
        if (history.isEmpty()) {
            return fetchDefaultRecommendations();
        }

        // Calculate preferences
        Map<String, Double> artistWeights = new HashMap<>();
        Map<String, Double> genreWeights = new HashMap<>();
        Set<String> alreadyPlayedIds = new HashSet<>();

        for (UserHistory item : history) {
            alreadyPlayedIds.add(item.getTrackId());
            double weight = item.getPlayCount() * 1.0;
            if (item.isLiked()) {
                weight += 10.0; // Likes carry heavy preference
            }
            if (item.isDisliked()) {
                weight -= 15.0; // Dislikes penalize heavily
            }

            if (item.getArtist() != null) {
                artistWeights.merge(item.getArtist().toLowerCase().trim(), weight, Double::sum);
            }
            if (item.getGenre() != null) {
                genreWeights.merge(item.getGenre().toLowerCase().trim(), weight, Double::sum);
            }
        }

        // Sort weights to get top preferences
        List<String> topArtists = artistWeights.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(3)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        List<String> topGenres = genreWeights.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(2)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        List<Track> candidates = new ArrayList<>();

        // Fetch candidates from iTunes based on top artists
        for (String artist : topArtists) {
            candidates.addAll(fetchTracksFromiTunes(artist, "artist"));
        }

        // Fetch candidates from iTunes based on top genres (if artists list was small or we need variety)
        for (String genre : topGenres) {
            candidates.addAll(fetchTracksFromiTunes(genre, "genre"));
        }

        // Deduplicate candidates and filter out already played or disliked ones
        Map<String, Track> uniqueCandidates = new HashMap<>();
        for (Track track : candidates) {
            if (alreadyPlayedIds.contains(track.getTrackId())) {
                continue; // Skip already played
            }
            uniqueCandidates.put(track.getTrackId(), track);
        }

        // Score candidates
        List<TrackWithScore> scoredTracks = new ArrayList<>();
        for (Track track : uniqueCandidates.values()) {
            double score = 0.0;
            
            // Check artist match
            String trackArtist = track.getArtist().toLowerCase().trim();
            if (artistWeights.containsKey(trackArtist)) {
                score += artistWeights.get(trackArtist) * 0.8;
            }

            // Check genre match
            String trackGenre = track.getGenre().toLowerCase().trim();
            if (genreWeights.containsKey(trackGenre)) {
                score += genreWeights.get(trackGenre) * 0.5;
            }

            // Inject small random factor for freshness (exploration vs exploitation)
            score += Math.random() * 2.0;

            scoredTracks.add(new TrackWithScore(track, score));
        }

        // Sort by score descending and return
        return scoredTracks.stream()
                .sorted(Comparator.comparingDouble(TrackWithScore::getScore).reversed())
                .limit(20)
                .map(TrackWithScore::getTrack)
                .collect(Collectors.toList());
    }

    private List<Track> fetchTracksFromiTunes(String term, String type) {
        List<Track> tracks = new ArrayList<>();
        try {
            String encodedTerm = URLEncoder.encode(term, StandardCharsets.UTF_8.toString());
            String url = "https://itunes.apple.com/search?term=" + encodedTerm + "&media=music&limit=15";
            if ("genre".equals(type)) {
                // If it's a genre, search music categories
                url = "https://itunes.apple.com/search?term=" + encodedTerm + "&media=music&entity=song&limit=15";
            }

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(4))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode results = root.path("results");
                for (JsonNode node : results) {
                    tracks.add(parseTrackNode(node));
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching candidates from iTunes for term '" + term + "': " + e.getMessage());
        }
        return tracks;
    }

    private List<Track> fetchDefaultRecommendations() {
        // High quality default artists to fetch from
        String[] defaults = {"Daft Punk", "The Weeknd", "Coldplay", "Billie Eilish", "Kygo"};
        List<Track> tracks = new ArrayList<>();
        
        // Pick a random default artist to keep the feed fresh on load
        String randomArtist = defaults[new Random().nextInt(defaults.length)];
        tracks.addAll(fetchTracksFromiTunes(randomArtist, "artist"));
        
        // Also fetch general pop/lofi hits
        tracks.addAll(fetchTracksFromiTunes("synthwave", "genre"));

        // Shuffle and limit to 20
        Collections.shuffle(tracks);
        return tracks.stream().distinct().limit(20).collect(Collectors.toList());
    }

    private Track parseTrackNode(JsonNode node) {
        String trackId = node.path("trackId").asText("");
        if (trackId.isEmpty()) {
            trackId = String.valueOf(node.path("artistId").asLong(0)) + "-" + node.path("trackName").asText("").hashCode();
        }
        String title = node.path("trackName").asText("Unknown Title");
        String artist = node.path("artistName").asText("Unknown Artist");
        String album = node.path("collectionName").asText("Single");
        
        // Upscale cover art to 600x600 for premium aesthetics
        String coverUrl = node.path("artworkUrl100").asText("");
        if (coverUrl.contains("100x100bb.jpg")) {
            coverUrl = coverUrl.replace("100x100bb.jpg", "600x600bb.jpg");
        }
        
        long durationMillis = node.path("trackTimeMillis").asLong(0);
        String duration = formatDuration(durationMillis);
        String genre = node.path("primaryGenreName").asText("Music");

        return new Track(trackId, title, artist, album, coverUrl, duration, genre, null);
    }

    private String formatDuration(long millis) {
        if (millis <= 0) return "0:00";
        long seconds = millis / 1000;
        long minutes = seconds / 60;
        seconds = seconds % 60;
        return String.format("%d:%02d", minutes, seconds);
    }

    // Helper static class to associate track and dynamic scores
    private static class TrackWithScore {
        private final Track track;
        private final double score;

        public TrackWithScore(Track track, double score) {
            this.track = track;
            this.score = score;
        }

        public Track getTrack() { return track; }
        public double getScore() { return score; }
    }
}
