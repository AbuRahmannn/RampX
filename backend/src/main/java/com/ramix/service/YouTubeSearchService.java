package com.ramix.service;

import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class YouTubeSearchService {

    private final Map<String, String> cache = new ConcurrentHashMap<>();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.ALWAYS)
            .build();

    private static final Pattern VIDEO_ID_PATTERN = Pattern.compile("\"videoId\"\\s*:\\s*\"([A-Za-z0-9_-]{11})\"");

    public String searchVideoId(String artist, String title) {
        String query = artist + " - " + title + " (Audio)";
        String cacheKey = query.toLowerCase().trim();
        
        if (cache.containsKey(cacheKey)) {
            return cache.get(cacheKey);
        }

        try {
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8.toString());
            String url = "https://www.youtube.com/results?search_query=" + encodedQuery;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .timeout(Duration.ofSeconds(8))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                String html = response.body();
                Matcher matcher = VIDEO_ID_PATTERN.matcher(html);
                if (matcher.find()) {
                    String videoId = matcher.group(1);
                    cache.put(cacheKey, videoId);
                    return videoId;
                }
            }
        } catch (Exception e) {
            System.err.println("Error searching YouTube for query '" + query + "': " + e.getMessage());
        }

        // Fallback search without "(Audio)" suffix if the first fails
        try {
            String simpleQuery = artist + " " + title;
            String encodedQuery = URLEncoder.encode(simpleQuery, StandardCharsets.UTF_8.toString());
            String url = "https://www.youtube.com/results?search_query=" + encodedQuery;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .timeout(Duration.ofSeconds(8))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                Matcher matcher = VIDEO_ID_PATTERN.matcher(response.body());
                if (matcher.find()) {
                    String videoId = matcher.group(1);
                    cache.put(cacheKey, videoId);
                    return videoId;
                }
            }
        } catch (Exception e) {
            System.err.println("Fallback error searching YouTube: " + e.getMessage());
        }

        return null; // Return null if not found
    }
}
