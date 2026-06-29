package com.ramix.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_history")
public class UserHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String trackId;
    private String title;
    private String artist;
    private String album;
    private String coverArt;
    private String genre;
    private LocalDateTime playedAt;
    private int playCount;
    private boolean liked;
    private boolean disliked;

    public UserHistory() {}

    public UserHistory(String trackId, String title, String artist, String album, String coverArt, String genre) {
        this.trackId = trackId;
        this.title = title;
        this.artist = artist;
        this.album = album;
        this.coverArt = coverArt;
        this.genre = genre;
        this.playedAt = LocalDateTime.now();
        this.playCount = 1;
        this.liked = false;
        this.disliked = false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTrackId() { return trackId; }
    public void setTrackId(String trackId) { this.trackId = trackId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getArtist() { return artist; }
    public void setArtist(String artist) { this.artist = artist; }

    public String getAlbum() { return album; }
    public void setAlbum(String album) { this.album = album; }

    public String getCoverArt() { return coverArt; }
    public void setCoverArt(String coverArt) { this.coverArt = coverArt; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }

    public LocalDateTime getPlayedAt() { return playedAt; }
    public void setPlayedAt(LocalDateTime playedAt) { this.playedAt = playedAt; }

    public int getPlayCount() { return playCount; }
    public void setPlayCount(int playCount) { this.playCount = playCount; }

    public boolean isLiked() { return liked; }
    public void setLiked(boolean liked) { this.liked = liked; }

    public boolean isDisliked() { return disliked; }
    public void setDisliked(boolean disliked) { this.disliked = disliked; }

    public void incrementPlayCount() {
        this.playCount++;
        this.playedAt = LocalDateTime.now();
    }
}
