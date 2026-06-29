package com.ramix.model;

import jakarta.persistence.*;

@Entity
@Table(name = "tracks")
public class Track {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String trackId; // e.g., iTunes trackId or unique key
    private String title;
    private String artist;
    private String album;
    private String coverArt;
    private String duration;
    private String genre;
    private String youtubeId; // Cached YouTube Video ID

    public Track() {}

    public Track(String trackId, String title, String artist, String album, String coverArt, String duration, String genre, String youtubeId) {
        this.trackId = trackId;
        this.title = title;
        this.artist = artist;
        this.album = album;
        this.coverArt = coverArt;
        this.duration = duration;
        this.genre = genre;
        this.youtubeId = youtubeId;
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

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }

    public String getYoutubeId() { return youtubeId; }
    public void setYoutubeId(String youtubeId) { this.youtubeId = youtubeId; }
}
