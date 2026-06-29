import React, { useState, useEffect } from 'react';
import BackgroundBlobs from './components/BackgroundBlobs';
import Sidebar from './components/Sidebar';
import MusicPlayer from './components/MusicPlayer';
import YoutubePlayerWrapper from './components/YoutubePlayerWrapper';
import Home from './views/Home';
import Search from './views/Search';
import Playlists from './views/Playlists';
import Library from './views/Library';
import DownloadAndroid from './views/DownloadAndroid';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [ytPlayer, setYtPlayer] = useState(null);
  
  // Audio state
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const [repeatMode, setRepeatMode] = useState('queue'); // 'off', 'queue', 'one'
  const [isShuffling, setIsShuffling] = useState(false);

  // Queue state
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);

  // Library/Favorites cache
  const [favorites, setFavorites] = useState([]);

  // Fetch favorites on load and when toggled
  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/library/favorites');
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
        localStorage.setItem('rampx_favorites', JSON.stringify(data));
      } else {
        const local = localStorage.getItem('rampx_favorites');
        if (local) setFavorites(JSON.parse(local));
      }
    } catch (e) {
      const local = localStorage.getItem('rampx_favorites');
      if (local) setFavorites(JSON.parse(local));
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Resolves the YouTube Video ID and logs play count in the backend database
  const handlePlayTrack = async (track, playlistTracks = []) => {
    try {
      setIsPlaying(true);
      setCurrentTrack(track);
      
      // Update queue settings
      if (playlistTracks.length > 0) {
        setQueue(playlistTracks);
        const idx = playlistTracks.findIndex(t => t.trackId === track.trackId);
        setQueueIndex(idx !== -1 ? idx : 0);
      } else {
        setQueue([track]);
        setQueueIndex(0);
      }

      // 1. Log play history to backend & localStorage fallback
      const logBody = {
        trackId: track.trackId,
        title: track.title,
        artist: track.artist,
        album: track.album || 'Single',
        coverArt: track.coverArt,
        genre: track.genre || 'Music'
      };

      try {
        await fetch('/api/library/history/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logBody)
        });
      } catch (e) {
        console.warn("Backend unavailable, logging history to localStorage");
        const localHist = localStorage.getItem('rampx_history');
        let historyArray = localHist ? JSON.parse(localHist) : [];
        const existing = historyArray.find(h => h.trackId === track.trackId);
        if (existing) {
          existing.playCount = (existing.playCount || 1) + 1;
          existing.playedAt = new Date().toISOString();
        } else {
          historyArray.unshift({
            ...logBody,
            id: Date.now(),
            playCount: 1,
            playedAt: new Date().toISOString()
          });
        }
        localStorage.setItem('rampx_history', JSON.stringify(historyArray.slice(0, 100)));
      }

      // 2. Fetch YouTube video ID via proxy controller with Invidious client-side fallback
      const params = new URLSearchParams({
        artist: track.artist,
        title: track.title,
        trackId: track.trackId,
        album: track.album || 'Single',
        coverArt: track.coverArt,
        duration: track.duration || '0:00',
        genre: track.genre || 'Music'
      });

      try {
        const res = await fetch(`/api/proxy/youtube-search?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setYoutubeVideoId(data.videoId);
        } else {
          throw new Error("Proxy error");
        }
      } catch (e) {
        console.warn("Backend proxy unavailable. Querying public YouTube indexers...");
        const queryStr = `${track.artist} - ${track.title}`;
        const encoded = encodeURIComponent(queryStr);
        const instances = [
          'https://vid.puffyan.us',
          'https://yewtu.be',
          'https://invidious.io'
        ];
        
        let resolved = false;
        for (const instance of instances) {
          try {
            const url = `${instance}/api/v1/search?q=${encoded}&type=video`;
            const searchRes = await fetch(url);
            if (searchRes.ok) {
              const data = await searchRes.json();
              if (data && data.length > 0 && data[0].videoId) {
                setYoutubeVideoId(data[0].videoId);
                resolved = true;
                break;
              }
            }
          } catch (err) {
            console.error(`Error querying ${instance}`, err);
          }
        }
        
        if (!resolved) {
          setYoutubeVideoId('dQw4w9WgXcQ'); // Rickroll default placeholder
        }
      }
    } catch (e) {
      console.error("Error setting up track playback", e);
      setIsPlaying(false);
    }
  };

  // Toggle favorite in database and update react cache state
  const handleToggleLike = async (track) => {
    const isLiked = favorites.some(f => f.trackId === track.trackId);
    let updated;
    if (isLiked) {
      updated = favorites.filter(f => f.trackId !== track.trackId);
    } else {
      updated = [...favorites, track];
    }
    
    // Optimistic UI state update
    setFavorites(updated);
    localStorage.setItem('rampx_favorites', JSON.stringify(updated));

    try {
      await fetch('/api/library/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId: track.trackId,
          title: track.title,
          artist: track.artist,
          album: track.album || 'Single',
          coverArt: track.coverArt,
          genre: track.genre || 'Music'
        })
      });
    } catch (e) {
      console.warn("Backend toggler failed, saved to local favorites cache", e);
    }
  };

  // Advance playback
  const handlePlayNext = (isAutoEnd = false) => {
    if (queue.length === 0) return;
    
    if (repeatMode === 'one') {
      // Re-trigger load video ID
      if (ytPlayer) {
        try {
          ytPlayer.seekTo(0);
          ytPlayer.playVideo();
          setIsPlaying(true);
        } catch (e) {}
      }
      return;
    }

    let nextIdx = queueIndex + 1;
    if (isShuffling) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      if (repeatMode === 'queue') {
        nextIdx = 0; // Wrap around to start of queue
      } else {
        // repeatMode === 'off'
        // If it ended naturally, we stop. If skipped manually, wrap around.
        if (isAutoEnd) {
          setIsPlaying(false);
          if (ytPlayer) {
            try {
              ytPlayer.pauseVideo();
            } catch (e) {}
          }
          return;
        } else {
          nextIdx = 0;
        }
      }
    }

    setQueueIndex(nextIdx);
    handlePlayTrack(queue[nextIdx], queue);
  };

  const handlePlayPrevious = () => {
    if (queue.length === 0) return;

    let prevIdx = queueIndex - 1;
    if (isShuffling) {
      prevIdx = Math.floor(Math.random() * queue.length);
    } else if (prevIdx < 0) {
      prevIdx = queue.length - 1; // Wrap around to end
    }

    setQueueIndex(prevIdx);
    handlePlayTrack(queue[prevIdx], queue);
  };

  // Handle YouTube player callbacks
  const handlePlayerReady = (playerInstance) => {
    setYtPlayer(playerInstance);
  };

  const handlePlayerStateChange = (state) => {
    // YT.PlayerState.ENDED is 0
    if (state === 0) {
      handlePlayNext(true);
    } else if (state === 1) {
      setIsPlaying(true);
    }
  };

  // Renders the main active view component
  const renderMainView = () => {
    switch (currentView) {
      case 'home':
        return (
          <Home 
            onPlayTrack={(track, list) => handlePlayTrack(track, list)} 
            currentTrack={currentTrack} 
            isPlaying={isPlaying} 
          />
        );
      case 'search':
        return (
          <Search 
            onPlayTrack={(track, list) => handlePlayTrack(track, list)} 
            currentTrack={currentTrack} 
          />
        );
      case 'playlists':
        return (
          <Playlists 
            onPlayTrack={(track, list) => handlePlayTrack(track, list)} 
            currentTrack={currentTrack} 
          />
        );
      case 'library':
        return (
          <Library 
            onPlayTrack={(track, list) => handlePlayTrack(track, list)} 
            currentTrack={currentTrack} 
            favorites={favorites}
            onToggleLike={handleToggleLike}
          />
        );
      case 'download':
        return <DownloadAndroid />;
      default:
        return <Home onPlayTrack={(track, list) => handlePlayTrack(track, list)} />;
    }
  };

  return (
    <>
      {/* Background blobs for Liquid Glass visual foundation */}
      <BackgroundBlobs />

      {/* Main Grid App Shell */}
      <div className="app-container">
        
        {/* Sidebar Nav */}
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

        {/* Content View Area */}
        <main className="main-area">
          {renderMainView()}
        </main>

        {/* Persistent Bottom Player Bar */}
        <MusicPlayer 
          currentTrack={currentTrack} 
          isPlaying={isPlaying} 
          setIsPlaying={setIsPlaying}
          onPlayNext={handlePlayNext}
          onPlayPrevious={handlePlayPrevious}
          ytPlayer={ytPlayer}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          volume={volume}
          setVolume={setVolume}
          repeatMode={repeatMode}
          setRepeatMode={setRepeatMode}
          isShuffling={isShuffling}
          setIsShuffling={setIsShuffling}
          favorites={favorites}
          onToggleLike={handleToggleLike}
          queue={queue}
          queueIndex={queueIndex}
          onPlayTrack={handlePlayTrack}
        />
      </div>

      {/* Invisible/Floating persistent video wrapper */}
      <YoutubePlayerWrapper 
        videoId={youtubeVideoId} 
        onPlayerReady={handlePlayerReady} 
        onPlayerStateChange={handlePlayerStateChange}
        isMuted={isMuted}
        volume={volume}
      />
    </>
  );
}
