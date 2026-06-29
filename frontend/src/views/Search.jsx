import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Play, Plus, ChevronDown, Check, Music, ListMusic } from 'lucide-react';

export default function Search({ onPlayTrack, currentTrack }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null); // trackId of active playlist dropdown
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('songs'); // 'songs', 'playlists'
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch playlists to show in the "Add to Playlist" dropdowns
  const fetchPlaylists = async () => {
    try {
      const res = await fetch('/api/library/playlists');
      if (res.ok) {
        const data = await res.json();
        setPlaylists(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      const encoded = encodeURIComponent(query.trim());
      const res = await fetch(`https://itunes.apple.com/search?term=${encoded}&media=music&entity=song&limit=30`);
      const data = await res.json();
      
      const tracks = data.results.map(item => {
        let coverUrl = item.artworkUrl100 || '';
        // Upscale image
        if (coverUrl.includes('100x100bb.jpg')) {
          coverUrl = coverUrl.replace('100x100bb.jpg', '600x600bb.jpg');
        }
        
        const durationSec = item.trackTimeMillis ? item.trackTimeMillis / 1000 : 0;
        const formatDuration = (secs) => {
          const m = Math.floor(secs / 60);
          const s = Math.floor(secs % 60);
          return `${m}:${s < 10 ? '0' : ''}${s}`;
        };

        return {
          trackId: String(item.trackId),
          title: item.trackName || 'Unknown Title',
          artist: item.artistName || 'Unknown Artist',
          album: item.collectionName || 'Single',
          coverArt: coverUrl,
          duration: formatDuration(durationSec),
          genre: item.primaryGenreName || 'Music'
        };
      });
      setResults(tracks);
      setSearchFilter('songs');
      setHasSearched(true);
    } catch (e) {
      console.error("Error searching iTunes API", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId, track) => {
    try {
      const res = await fetch(`/api/library/playlists/${playlistId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(track)
      });
      if (res.ok) {
        // Toggle dropdown closed
        setActiveDropdown(null);
        alert(`Added "${track.title}" to playlist!`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Search Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '2rem', fontWeight: 800, marginBottom: '12px' }}>
          Discover Music
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Search for songs, artists, or albums. Streaming is powered by on-demand YouTube resolution.
        </p>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="glass-input-container">
          <SearchIcon size={20} color="rgba(255, 255, 255, 0.4)" />
          <input 
            type="text" 
            placeholder="Search songs, artists, genres..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="glass-input"
          />
          <button type="submit" style={{ display: 'none' }} />
        </form>
      </div>

      {/* Search Categories Selector */}
      {hasSearched && (
        <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '12px', marginTop: '-10px' }}>
          <button
            onClick={() => setSearchFilter('songs')}
            className={`glass-btn ${searchFilter === 'songs' ? 'active' : ''}`}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            Songs ({results.length})
          </button>
          <button
            onClick={() => setSearchFilter('playlists')}
            className={`glass-btn ${searchFilter === 'playlists' ? 'active' : ''}`}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            Playlists ({playlists.filter(pl => pl.name.toLowerCase().includes(query.toLowerCase())).length})
          </button>
        </div>
      )}

      {/* Results Section */}
      <div>
        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Searching the cosmos...</div>
        ) : searchFilter === 'songs' ? (
          results.length === 0 ? (
            query ? (
              <div style={{ color: 'var(--text-muted)' }}>No matches found. Try another search.</div>
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '250px',
                color: 'var(--text-muted)',
                gap: '12px'
              }}>
                <SearchIcon size={48} style={{ opacity: 0.3 }} />
                <span>Enter a search term above to explore</span>
              </div>
            )
          ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
            gap: '24px' 
          }}>
            {results.map((track) => {
              const isCurrent = currentTrack && currentTrack.trackId === track.trackId;
              const dropdownOpen = activeDropdown === track.trackId;

              return (
                <div 
                  key={track.trackId} 
                  className="glass-card"
                  style={{ 
                    padding: '16px', 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative'
                  }}
                >
                  {/* Album Cover & Play Hover Overlay */}
                  <div 
                    style={{ position: 'relative', width: '100%', paddingBottom: '100%', borderRadius: '12px', overflow: 'hidden' }}
                    onClick={() => onPlayTrack(track, results)}
                  >
                    <img 
                      src={track.coverArt || 'https://via.placeholder.com/150'} 
                      alt={track.title} 
                      style={{ 
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        objectFit: 'cover',
                        cursor: 'pointer'
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
                      transition: 'opacity 0.2s ease',
                      cursor: 'pointer'
                    }} className="play-overlay">
                      <div className="glass-btn-circle" style={{ 
                        width: '45px', 
                        height: '45px', 
                        background: 'rgba(255,255,255,0.9)', 
                        color: '#000', 
                        border: 'none' 
                      }}>
                        <Play size={20} fill="#000" />
                      </div>
                    </div>
                  </div>

                  {/* Track Details & Add to Playlist dropdown trigger */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }} onClick={() => onPlayTrack(track, results)}>
                      <span style={{ 
                        fontWeight: 600, 
                        fontSize: '0.95rem',
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        cursor: 'pointer',
                        color: isCurrent ? 'var(--accent-purple)' : '#fff'
                      }}>
                        {track.title}
                      </span>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        cursor: 'pointer'
                      }}>
                        {track.artist}
                      </span>
                    </div>

                    {/* Playlist "+" Button Dropdown */}
                    <div style={{ position: 'relative' }}>
                      <button 
                        onClick={() => setActiveDropdown(dropdownOpen ? null : track.trackId)}
                        className="glass-btn-circle"
                        style={{ width: '28px', height: '28px', border: 'none', background: 'rgba(255,255,255,0.05)' }}
                        title="Add to playlist"
                      >
                        <Plus size={14} />
                      </button>

                      {/* Dropdown Menu */}
                      {dropdownOpen && (
                        <div 
                          className="glass-panel"
                          style={{
                            position: 'absolute',
                            bottom: '36px',
                            right: 0,
                            width: '180px',
                            maxHeight: '150px',
                            overflowY: 'auto',
                            zIndex: 10,
                            padding: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            background: 'rgba(12, 12, 18, 0.95)',
                            border: 'var(--glass-border-focused)',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
                          }}
                        >
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '6px 8px', fontWeight: 600, textTransform: 'uppercase' }}>
                            Add to playlist
                          </span>
                          {playlists.length === 0 ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '4px 8px' }}>
                              No playlists created yet.
                            </span>
                          ) : (
                            playlists.map(pl => (
                              <button
                                key={pl.id}
                                onClick={() => handleAddToPlaylist(pl.id, track)}
                                style={{
                                  fontSize: '0.82rem',
                                  padding: '8px 12px',
                                  border: 'none',
                                  justifyContent: 'flex-start',
                                  width: '100%',
                                  background: 'transparent',
                                  color: '#fff',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  transition: 'var(--transition-smooth)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                {pl.name}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )) : (
          /* Playlists Search Results */
          playlists.filter(pl => pl.name.toLowerCase().includes(query.toLowerCase())).length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>No matching playlists found.</div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
              gap: '16px' 
            }}>
              {playlists.filter(pl => pl.name.toLowerCase().includes(query.toLowerCase())).map(pl => {
                const count = pl.tracks ? pl.tracks.length : 0;
                return (
                  <div 
                    key={pl.id} 
                    className="glass-card"
                    onClick={() => pl.tracks && pl.tracks.length > 0 && onPlayTrack(pl.tracks[0], pl.tracks)}
                    style={{ 
                      padding: '16px', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(0, 0, 0, 0.4) 100%)'
                    }}
                  >
                    <div className="glass-panel" style={{ width: '44px', height: '44px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                      <Music size={18} style={{ opacity: 0.5 }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {pl.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {count} tracks
                      </span>
                    </div>
                    {count > 0 && (
                      <div className="glass-btn-circle" style={{ width: '36px', height: '36px', background: '#fff', color: '#000', border: 'none' }}>
                        <Play size={14} fill="#000" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      <style>{`
        .play-overlay:hover {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
