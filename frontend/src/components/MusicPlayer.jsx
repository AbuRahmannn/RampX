import React, { useEffect, useState, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, Shuffle, 
  Volume2, VolumeX, Heart, ListMusic, X, Cpu
} from 'lucide-react';

export default function MusicPlayer({ 
  currentTrack, 
  isPlaying, 
  setIsPlaying, 
  onPlayNext, 
  onPlayPrevious, 
  ytPlayer, 
  isMuted, 
  setIsMuted, 
  volume, 
  setVolume, 
  repeatMode, 
  setRepeatMode, 
  isShuffling, 
  setIsShuffling,
  favorites,
  onToggleLike,
  queue = [],
  queueIndex = -1,
  onPlayTrack
}) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const progressInterval = useRef(null);

  const isLiked = currentTrack && favorites.some(fav => fav.trackId === currentTrack.trackId);

  // 1. Sync Play/Pause state with YT Player
  useEffect(() => {
    if (!ytPlayer) return;
    try {
      if (isPlaying) {
        ytPlayer.playVideo();
      } else {
        ytPlayer.pauseVideo();
      }
    } catch (e) {}
  }, [isPlaying, ytPlayer]);

  // 2. Poll current elapsed time from YT Player
  useEffect(() => {
    if (isPlaying && ytPlayer) {
      progressInterval.current = setInterval(() => {
        try {
          const curr = ytPlayer.getCurrentTime();
          const dur = ytPlayer.getDuration();
          if (curr) setCurrentTime(curr);
          if (dur) setDuration(dur);
        } catch (e) {}
      }, 500);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, ytPlayer]);

  // 3. Reset progress when track changes
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
  }, [currentTrack]);

  // 4. Format seconds to MM:SS
  const formatTime = (secs) => {
    if (isNaN(secs) || secs === null || secs === undefined) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 5. Handle seek input
  const handleSeekChange = (e) => {
    const seekVal = parseFloat(e.target.value);
    setCurrentTime(seekVal);
    if (ytPlayer) {
      try {
        ytPlayer.seekTo(seekVal, true);
      } catch (err) {}
    }
  };

  if (!currentTrack) {
    return (
      <div className="player-area glass-panel" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: 'var(--text-muted)',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        Select a track to start playing
      </div>
    );
  }

  return (
    <div className="player-area glass-panel" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '0 24px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      gap: '24px',
      position: 'relative'
    }}>
      
      {/* Top Progress Line (Mobile Only) */}
      <div 
        className="mobile-only"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '2.5px',
          background: '#ffffff',
          width: `${(currentTime / (duration || 1)) * 100}%`,
          transition: 'width 0.1s linear',
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.4)'
        }}
      />
      
      {/* Left: Track Info & Liquid AI Light */}
      <div className="player-left-section" style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '30%', minWidth: '220px' }}>
        <img 
          src={currentTrack.coverArt || 'https://via.placeholder.com/60'} 
          alt={currentTrack.title} 
          style={{ 
            width: '56px', 
            height: '56px', 
            borderRadius: '14px', 
            objectFit: 'cover',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: isPlaying ? '0 0 20px var(--accent-purple-glow)' : 'none',
            animation: isPlaying ? 'spin 16s linear infinite' : 'none'
          }} 
        />
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Liquid AI pulsing light */}
            <div 
              className={isPlaying ? "pulsing" : ""}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--accent-cyan)',
                boxShadow: '0 0 8px var(--accent-cyan)',
                flexShrink: 0
              }} 
              title="Liquid AI Analysis Active"
            />
            <span style={{ 
              fontWeight: 600, 
              fontSize: '0.95rem', 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}>
              {currentTrack.title}
            </span>
          </div>
          <span style={{ 
            fontSize: '0.8rem', 
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            marginTop: '2px'
          }}>
            {currentTrack.artist}
          </span>
        </div>
        
        {/* Heart/Like Toggle */}
        <button 
          onClick={() => onToggleLike(currentTrack)}
          className="glass-btn-circle" 
          style={{ 
            width: '34px', 
            height: '34px', 
            border: 'none', 
            background: isLiked ? 'rgba(217, 4, 121, 0.15)' : 'transparent' 
          }}
        >
          <Heart 
            size={16} 
            fill={isLiked ? "var(--accent-pink)" : "transparent"} 
            color={isLiked ? "var(--accent-pink)" : "#fff"} 
            style={{ filter: isLiked ? 'drop-shadow(0 0 5px var(--accent-pink-glow))' : 'none' }}
          />
        </button>
      </div>

      {/* Center: Controls & Scrubber */}
      <div className="player-center-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '600px' }}>
        {/* Playback Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Shuffle Toggle */}
          <button 
            onClick={() => setIsShuffling(!isShuffling)} 
            className="desktop-only"
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: isShuffling ? 'var(--accent-cyan)' : 'var(--text-muted)', 
              cursor: 'pointer',
              textShadow: isShuffling ? '0 0 10px var(--accent-cyan-glow)' : 'none',
              transition: 'var(--transition-smooth)'
            }}
            title={isShuffling ? "Shuffle On" : "Shuffle Off"}
          >
            <Shuffle size={18} />
          </button>
          
          {/* Previous Skip */}
          <button onClick={onPlayPrevious} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <SkipBack size={20} fill="#fff" />
          </button>
          
          {/* Apple Play / Pause Rounded circle */}
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="glass-btn-circle" 
            style={{ 
              width: '46px', 
              height: '46px', 
              background: '#ffffff', 
              color: '#000000', 
              border: 'none',
              boxShadow: '0 4px 15px rgba(255, 255, 255, 0.3)'
            }}
          >
            {isPlaying ? <Pause size={20} fill="#000" /> : <Play size={20} fill="#000" style={{ marginLeft: '2px' }} />}
          </button>
          
          {/* Next Skip */}
          <button onClick={onPlayNext} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <SkipForward size={20} fill="#fff" />
          </button>
          
          {/* Repeat Mode Toggle (Cycle: off -> queue -> one) */}
          <button 
            onClick={() => {
              if (repeatMode === 'off') setRepeatMode('queue');
              else if (repeatMode === 'queue') setRepeatMode('one');
              else setRepeatMode('off');
            }}
            className="desktop-only"
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: repeatMode === 'off' ? 'var(--text-muted)' : (repeatMode === 'queue' ? 'var(--accent-purple)' : 'var(--accent-pink)'), 
              cursor: 'pointer',
              textShadow: repeatMode === 'off' ? 'none' : (repeatMode === 'queue' ? '0 0 10px var(--accent-purple-glow)' : '0 0 10px var(--accent-pink-glow)'),
              transition: 'var(--transition-smooth)'
            }}
            title={repeatMode === 'off' ? "Repeat Off (Play once)" : (repeatMode === 'queue' ? "Repeat Queue (Repeat All)" : "Repeat Song (Repeat One)")}
          >
            {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
          </button>
        </div>

        {/* Playback Progress Scrubber */}
        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: '35px', textAlign: 'right' }}>
            {formatTime(currentTime)}
          </span>
          <input 
            type="range" 
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeekChange}
            className="glass-slider"
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: '35px' }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right: Volume & Queue Toggle */}
      <div className="player-right-section" style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '30%', minWidth: '200px', justifyContent: 'flex-end' }}>
        
        {/* Play Queue Drawer Toggle Button */}
        <button 
          onClick={() => setIsQueueOpen(!isQueueOpen)}
          className="glass-btn-circle"
          style={{ 
            width: '36px', 
            height: '36px', 
            border: 'none', 
            background: isQueueOpen ? 'rgba(130, 10, 212, 0.15)' : 'transparent',
            color: isQueueOpen ? 'var(--accent-purple)' : '#fff'
          }}
          title="Play Queue"
        >
          <ListMusic size={18} />
        </button>

        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input 
            type="range" 
            min={0}
            max={100}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseInt(e.target.value));
              setIsMuted(false);
            }}
            className="glass-slider"
            style={{ width: '80px' }}
          />
        </div>
      </div>

      {/* Slide-out Queue Drawer */}
      <div className={`queue-drawer glass-panel ${isQueueOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={16} color="var(--accent-cyan)" />
            <h3 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.15rem', fontWeight: 800 }}>Play Queue</h3>
          </div>
          <button 
            onClick={() => setIsQueueOpen(false)}
            className="glass-btn-circle" 
            style={{ width: '28px', height: '28px', border: 'none' }}
          >
            <X size={14} />
          </button>
        </div>
        
        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)' }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Now Playing
          </span>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', gap: '12px', border: '1px solid rgba(130, 10, 212, 0.2)' }}>
            <img src={currentTrack.coverArt} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
            <div style={{ overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--accent-purple)' }}>
                {currentTrack.title}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                {currentTrack.artist}
              </span>
            </div>
          </div>
          
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginTop: '10px' }}>
            Next Up
          </span>
          {queue.slice(queueIndex + 1).length === 0 ? (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Queue is empty</span>
          ) : (
            queue.slice(queueIndex + 1).map((track, i) => {
              const actualIdx = queueIndex + 1 + i;
              return (
                <div 
                  key={track.trackId + '-' + actualIdx}
                  className="glass-card"
                  onClick={() => {
                    if (onPlayTrack) {
                      onPlayTrack(track, queue);
                    }
                  }}
                  style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: '12px', cursor: 'pointer' }}
                >
                  <img src={track.coverArt} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                  <div style={{ overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {track.title}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                      {track.artist}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* CSS Animation injection for Rotating Disc */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
