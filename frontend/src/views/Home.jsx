import React, { useEffect, useState } from 'react';
import { Play, Sparkles, Disc, Activity } from 'lucide-react';

export default function Home({ onPlayTrack, currentTrack, isPlaying }) {
  const [recommendations, setRecommendations] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiMoodMessage, setAiMoodMessage] = useState('');
  const [aiMoodTitle, setAiMoodTitle] = useState('Initializing AI...');

  // Spotify-inspired Preset Mixes (crawled on-demand from iTunes search)
  const [chillMix, setChillMix] = useState([]);
  const [energyMix, setEnergyMix] = useState([]);
  const [focusMix, setFocusMix] = useState([]);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch smart recommendations
      const recRes = await fetch('/api/library/recommendations');
      const recs = await recRes.json();
      setRecommendations(recs);

      // 2. Fetch listening history
      const histRes = await fetch('/api/library/history');
      const hist = await histRes.json();
      const uniqueHist = [];
      const seen = new Set();
      for (const item of hist) {
        if (!seen.has(item.trackId)) {
          seen.add(item.trackId);
          uniqueHist.push(item);
        }
      }
      setRecentlyPlayed(uniqueHist.slice(0, 6));

      // 3. Fetch Spotify-style Mixes
      const chillRes = await fetch('https://itunes.apple.com/search?term=synthwave+chill&media=music&entity=song&limit=10');
      const chillData = await chillRes.json();
      setChillMix(parseTracks(chillData.results));

      const energyRes = await fetch('https://itunes.apple.com/search?term=dance+hits&media=music&entity=song&limit=10');
      const energyData = await energyRes.json();
      setEnergyMix(parseTracks(energyData.results));

      const focusRes = await fetch('https://itunes.apple.com/search?term=lofi+focus&media=music&entity=song&limit=10');
      const focusData = await focusRes.json();
      setFocusMix(parseTracks(focusData.results));

      // 4. Compute AI Vibe Message based on history
      generateAIMood(uniqueHist);

    } catch (e) {
      console.error("Error loading home details", e);
    } finally {
      setLoading(false);
    }
  };

  const parseTracks = (results) => {
    return results.map(item => {
      let coverUrl = item.artworkUrl100 || '';
      if (coverUrl.includes('100x100bb.jpg')) {
        coverUrl = coverUrl.replace('100x100bb.jpg', '600x600bb.jpg');
      }
      const durationSec = item.trackTimeMillis ? item.trackTimeMillis / 1000 : 0;
      const m = Math.floor(durationSec / 60);
      const s = Math.floor(durationSec % 60);
      return {
        trackId: String(item.trackId),
        title: item.trackName || 'Unknown Title',
        artist: item.artistName || 'Unknown Artist',
        album: item.collectionName || 'Single',
        coverArt: coverUrl,
        duration: `${m}:${s < 10 ? '0' : ''}${s}`,
        genre: item.primaryGenreName || 'Music'
      };
    });
  };

  const generateAIMood = (historyList) => {
    if (historyList.length === 0) {
      setAiMoodTitle("Exploring Vibe Profile");
      setAiMoodMessage("Your profile is fresh. Play songs from the Spotify Mixes below or Search so I can begin analyzing your listening patterns and craft your custom Liquid Vibe.");
      return;
    }

    // Tally genres
    const genreTally = {};
    historyList.forEach(item => {
      if (item.genre) {
        genreTally[item.genre] = (genreTally[item.genre] || 0) + 1;
      }
    });

    // Find top genre
    let topGenre = '';
    let maxCount = 0;
    Object.entries(genreTally).forEach(([genre, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topGenre = genre;
      }
    });

    const genreLower = topGenre.toLowerCase();
    if (genreLower.includes('pop') || genreLower.includes('dance')) {
      setAiMoodTitle("Upbeat & Energetic");
      setAiMoodMessage(`LIQUID AI: I detected a high concentration of ${topGenre} in your library. Pitching dynamic beats and upbeat rhythms for your profile.`);
    } else if (genreLower.includes('rock') || genreLower.includes('metal')) {
      setAiMoodTitle("Raw Rock Rebellion");
      setAiMoodMessage(`LIQUID AI: You are riding a rock-heavy vibe. Streaming high-energy riffs, raw guitars, and classic classics.`);
    } else if (genreLower.includes('electronic') || genreLower.includes('ambient') || genreLower.includes('synth') || genreLower.includes('lo') || genreLower.includes('chill')) {
      setAiMoodTitle("Deep Chill & Cyberpunk");
      setAiMoodMessage(`LIQUID AI: Your listening profile is currently docked at Retrowave Chill. Resolving mellow, synthesizer-heavy tracks and lo-fi focus soundscapes.`);
    } else {
      setAiMoodTitle("Eclectic & Diverse Vibe");
      setAiMoodMessage(`LIQUID AI: Your library spans a rich variety of sounds. Blending diverse genres to keep your recommendation mix dynamic and fresh.`);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, [currentTrack]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      
      {/* Liquid AI Glass Header Banner */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '30px 40px', 
          background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.6) 0%, rgba(2, 2, 4, 0.65) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '30px',
          flexWrap: 'wrap',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Interactive Morphing Liquid AI Orb */}
        <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
          <div 
            className={`liquid-ai-orb ${isPlaying ? 'pulsing' : ''}`} 
            style={{ width: '100%', height: '100%' }}
          />
          <Activity 
            size={24} 
            color="#fff" 
            style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))'
            }} 
          />
        </div>

        {/* AI Message */}
        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={14} color="#ffffff" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.4))' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Mood Analysis
            </span>
          </div>
          <h1 style={{ 
            fontFamily: 'var(--font-family-heading)', 
            fontSize: '1.8rem', 
            fontWeight: 800, 
            marginBottom: '8px'
          }}>
            {aiMoodTitle}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
            {aiMoodMessage}
          </p>
        </div>
      </div>

      {/* Spotify Inspired Daily Mixes */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px' }}>
          Spotify Preset Mixes
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '20px' 
        }}>
          {/* Chill Mix */}
          <div 
            className="glass-card"
            onClick={() => chillMix.length > 0 && onPlayTrack(chillMix[0], chillMix)}
            style={{ 
              padding: '20px', 
              cursor: 'pointer',
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.45) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Chill Mix</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mellow synthwave and relaxing instrumental vibes.</p>
            </div>
            <div className="glass-btn-circle" style={{ width: '48px', height: '48px', flexShrink: 0, background: '#fff', color: '#000' }}>
              <Play size={20} fill="#000" />
            </div>
          </div>

          {/* Energy Mix */}
          <div 
            className="glass-card"
            onClick={() => energyMix.length > 0 && onPlayTrack(energyMix[0], energyMix)}
            style={{ 
              padding: '20px', 
              cursor: 'pointer',
              background: 'linear-gradient(180deg, rgba(209, 209, 214, 0.04) 0%, rgba(0, 0, 0, 0.45) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Energy Mix</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Upbeat hits to spark your dynamic energy.</p>
            </div>
            <div className="glass-btn-circle" style={{ width: '48px', height: '48px', flexShrink: 0, background: '#fff', color: '#000' }}>
              <Play size={20} fill="#000" />
            </div>
          </div>

          {/* Focus Mix */}
          <div 
            className="glass-card"
            onClick={() => focusMix.length > 0 && onPlayTrack(focusMix[0], focusMix)}
            style={{ 
              padding: '20px', 
              cursor: 'pointer',
              background: 'linear-gradient(180deg, rgba(142, 142, 147, 0.03) 0%, rgba(0, 0, 0, 0.45) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Focus Mix</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Lo-fi beats for coding, study, and concentration.</p>
            </div>
            <div className="glass-btn-circle" style={{ width: '48px', height: '48px', flexShrink: 0, background: '#fff', color: '#000' }}>
              <Play size={20} fill="#000" />
            </div>
          </div>
        </div>
      </div>

      {/* Recommended for You */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px' }}>
          Recommended Tracks
        </h2>
        
        {loading && recommendations.length === 0 ? (
          <div style={{ color: 'var(--text-muted)' }}>Calculating your perfect mix...</div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
            gap: '20px' 
          }}>
            {recommendations.map((track) => {
              const isCurrent = currentTrack && currentTrack.trackId === track.trackId;
              return (
                <div 
                  key={track.trackId} 
                  className="glass-card"
                  onClick={() => onPlayTrack(track, recommendations)}
                  style={{ 
                    padding: '14px', 
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                    <img 
                      src={track.coverArt || 'https://via.placeholder.com/150'} 
                      alt={track.title} 
                      style={{ 
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{ 
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: 'rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: isCurrent ? 1 : 0,
                      transition: 'opacity 0.2s ease'
                    }} className="play-overlay">
                      <div className="glass-btn-circle" style={{ 
                        width: '44px', 
                        height: '44px', 
                        background: '#ffffff', 
                        color: '#000000', 
                        border: 'none',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.4)'
                      }}>
                        <Play size={18} fill="#000" />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0 4px' }}>
                    <span style={{ 
                      fontWeight: 600, 
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      color: isCurrent ? 'var(--accent-pink)' : '#fff'
                    }}>
                      {track.title}
                    </span>
                    <span style={{ 
                      fontSize: '0.78rem', 
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      marginTop: '2px'
                    }}>
                      {track.artist}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <div>
          <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px' }}>
            Recently Played
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '16px' 
          }}>
            {recentlyPlayed.map((track) => (
              <div 
                key={track.trackId} 
                className="glass-card"
                onClick={() => onPlayTrack(track, recentlyPlayed)}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  gap: '16px',
                  cursor: 'pointer'
                }}
              >
                <img 
                  src={track.coverArt || 'https://via.placeholder.com/60'} 
                  alt={track.title} 
                  style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {track.title}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                    {track.artist}
                  </span>
                </div>
                <div className="glass-btn-circle" style={{ width: '32px', height: '32px', border: 'none', background: 'rgba(255,255,255,0.06)' }}>
                  <Play size={12} fill="#fff" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <style>{`
        .play-overlay:hover {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
