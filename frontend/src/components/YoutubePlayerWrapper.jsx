import React, { useEffect, useRef, useState } from 'react';
import { Minimize2, Maximize2, Video, VideoOff } from 'lucide-react';

export default function YoutubePlayerWrapper({ videoId, onPlayerReady, onPlayerStateChange, isMuted, volume }) {
  const [isMinimized, setIsMinimized] = useState(true);
  const [showVideo, setShowVideo] = useState(true);
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // 1. Load YouTube Iframe API if not loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };

    function initializePlayer() {
      if (playerRef.current) return;

      playerRef.current = new window.YT.Player('youtube-player-iframe', {
        height: '100%',
        width: '100%',
        videoId: videoId || 'dQw4w9WgXcQ', // default placeholder
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          modestbranding: 1
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(volume);
            if (onPlayerReady) {
              onPlayerReady(event.target);
            }
          },
          onStateChange: (event) => {
            if (onPlayerStateChange) {
              onPlayerStateChange(event.data);
            }
          }
        }
      });
    }
  }, []);

  // 2. Play video when videoId changes
  useEffect(() => {
    if (playerRef.current && videoId) {
      try {
        playerRef.current.loadVideoById(videoId);
        playerRef.current.playVideo();
      } catch (e) {
        console.error("Error loading video in YT Player", e);
      }
    }
  }, [videoId]);

  // 3. Keep volume and mute updated
  useEffect(() => {
    if (playerRef.current) {
      try {
        if (isMuted) {
          playerRef.current.mute();
        } else {
          playerRef.current.unMute();
          playerRef.current.setVolume(volume);
        }
      } catch (e) {}
    }
  }, [volume, isMuted]);

  return (
    <>
      <div
        ref={containerRef}
        className="glass-panel"
        style={{
          position: 'fixed',
          bottom: '132px',
          right: '24px',
          zIndex: 999,
          width: isMinimized ? '200px' : '400px',
          height: isMinimized ? '112px' : '225px',
          transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
          overflow: 'hidden',
          display: showVideo && videoId ? 'flex' : 'none',
          flexDirection: 'column',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        {/* Mini Header Control Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          background: 'rgba(0, 0, 0, 0.4)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <span style={{ fontWeight: 500 }}>YouTube Stream</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setShowVideo(false)} 
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title="Hide video stream"
            >
              <VideoOff size={13} />
            </button>
            <button 
              onClick={() => setIsMinimized(!isMinimized)} 
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title={isMinimized ? "Expand video" : "Minimize video"}
            >
              {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
            </button>
          </div>
        </div>

        {/* Video Content Iframe Div */}
        <div style={{ flex: 1, background: '#000' }}>
          <div id="youtube-player-iframe"></div>
        </div>
      </div>
      
      {/* Small floating button if video is hidden to bring it back */}
      {!showVideo && videoId && (
        <button
          onClick={() => setShowVideo(true)}
          className="glass-btn-circle"
          style={{
            position: 'fixed',
            bottom: '132px',
            right: '24px',
            zIndex: 1000,
            background: 'var(--glass-bg)',
            boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)',
            border: 'var(--glass-border-focused)'
          }}
          title="Show video stream"
        >
          <Video size={18} />
        </button>
      )}
    </>
  );
}
