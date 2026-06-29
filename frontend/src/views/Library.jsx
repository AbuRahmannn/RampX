import React, { useEffect, useState } from 'react';
import { 
  Heart, Play, History, Music, Trash2, ListMusic, 
  Calendar, X, Plus, ChevronRight, SlidersHorizontal 
} from 'lucide-react';

export default function Library({ onPlayTrack, currentTrack, favorites, onToggleLike }) {
  // Collection States
  const [history, setHistory] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sorting & Filtering Options
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'liked', 'playlists', 'history'
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'alphabetical', 'artist'

  // Playlist CRUD States
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/library/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error("Error fetching library history", e);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const res = await fetch('/api/library/playlists');
      if (res.ok) {
        const data = await res.json();
        setPlaylists(data);
        if (selectedPlaylist) {
          const updated = data.find(p => p.id === selectedPlaylist.id);
          setSelectedPlaylist(updated || null);
        }
      }
    } catch (e) {
      console.error("Error fetching playlists", e);
    }
  };

  const fetchLibraryData = async () => {
    setLoading(true);
    await Promise.all([fetchHistory(), fetchPlaylists()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchLibraryData();
  }, [currentTrack, favorites]);

  // Playlist Action Handlers
  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    try {
      const res = await fetch('/api/library/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlaylistName.trim() })
      });
      if (res.ok) {
        setNewPlaylistName('');
        fetchPlaylists();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePlaylist = async (id, name, e) => {
    if (e) e.stopPropagation();
    if (!confirm(`Are you sure you want to delete playlist "${name}"?`)) return;
    try {
      const res = await fetch(`/api/library/playlists/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedPlaylist && selectedPlaylist.id === id) {
          setSelectedPlaylist(null);
        }
        fetchPlaylists();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveTrack = async (trackId, e) => {
    if (e) e.stopPropagation();
    if (!selectedPlaylist) return;
    try {
      const res = await fetch(`/api/library/playlists/${selectedPlaylist.id}/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId })
      });
      if (res.ok) {
        fetchPlaylists();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your listening history? (Your liked songs will be preserved.)")) {
      return;
    }
    try {
      const res = await fetch('/api/library/history', { method: 'DELETE' });
      if (res.ok) {
        fetchHistory();
      }
    } catch (e) {
      console.error("Error clearing history", e);
    }
  };

  // Sorting Calculators
  const getSortedFavorites = () => {
    let list = [...favorites];
    if (sortBy === 'alphabetical') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'artist') {
      list.sort((a, b) => a.artist.localeCompare(b.artist));
    }
    return list;
  };

  const getSortedHistory = () => {
    let list = [...history];
    if (sortBy === 'alphabetical') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'artist') {
      list.sort((a, b) => a.artist.localeCompare(b.artist));
    }
    return list;
  };

  const getSortedPlaylists = () => {
    let list = [...playlists];
    if (sortBy === 'alphabetical') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  };

  // Date format formatter
  const formatPlayedAt = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit' 
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Filter and Sort Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        paddingBottom: '16px'
      }}>
        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => { setActiveFilter('all'); setSelectedPlaylist(null); }}
            className={`glass-btn ${activeFilter === 'all' ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            All Collections
          </button>
          <button 
            onClick={() => { setActiveFilter('liked'); setSelectedPlaylist(null); }}
            className={`glass-btn ${activeFilter === 'liked' ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Liked Songs
          </button>
          <button 
            onClick={() => { setActiveFilter('playlists'); setSelectedPlaylist(null); }}
            className={`glass-btn ${activeFilter === 'playlists' ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Playlists
          </button>
          <button 
            onClick={() => { setActiveFilter('history'); setSelectedPlaylist(null); }}
            className={`glass-btn ${activeFilter === 'history' ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            History
          </button>
        </div>

        {/* Sort Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sort by:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ 
              background: 'rgba(255, 255, 255, 0.02)', 
              color: '#fff', 
              border: 'var(--glass-border)', 
              borderRadius: '8px', 
              padding: '6px 12px', 
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-family-ui)'
            }}
          >
            <option value="recent" style={{ background: '#0e0e14' }}>Recently Played / Created</option>
            <option value="alphabetical" style={{ background: '#0e0e14' }}>Alphabetical (A-Z)</option>
            {activeFilter !== 'playlists' && (
              <option value="artist" style={{ background: '#0e0e14' }}>Artist Name</option>
            )}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Loading collection...</div>
      ) : (
        <>
          {/* VIEW: ALL COLLECTIONS */}
          {activeFilter === 'all' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              
              {/* Playlists and Faves Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                
                {/* Playlists Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ListMusic size={18} /> Playlists
                    </h2>
                    <button 
                      onClick={() => setActiveFilter('playlists')}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}
                    >
                      Show all <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {playlists.length === 0 ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '10px' }}>No playlists yet.</span>
                    ) : (
                      getSortedPlaylists().slice(0, 3).map(pl => (
                        <div 
                          key={pl.id} 
                          className="glass-card" 
                          onClick={() => { setActiveFilter('playlists'); setSelectedPlaylist(pl); }}
                          style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: '12px', cursor: 'pointer' }}
                        >
                          <div className="glass-panel" style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                            <Music size={14} style={{ opacity: 0.5 }} />
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.88rem', flex: 1 }}>{pl.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pl.tracks ? pl.tracks.length : 0} tracks</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Liked Songs Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Heart size={18} fill="var(--accent-purple)" /> Liked Songs
                    </h2>
                    <button 
                      onClick={() => setActiveFilter('liked')}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}
                    >
                      Show all <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {favorites.length === 0 ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '10px' }}>No liked songs yet.</span>
                    ) : (
                      getSortedFavorites().slice(0, 3).map(track => (
                        <div 
                          key={track.trackId} 
                          className="glass-card" 
                          onClick={() => onPlayTrack(track, favorites)}
                          style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: '12px', cursor: 'pointer' }}
                        >
                          <img src={track.coverArt} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                            <span style={{ fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Listening History Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <History size={18} /> Recently Played
                  </h2>
                  <button 
                    onClick={() => setActiveFilter('history')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}
                  >
                    Show all <ChevronRight size={14} />
                  </button>
                </div>
                <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  {history.length === 0 ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '10px' }}>No played items in logs.</span>
                  ) : (
                    getSortedHistory().slice(0, 5).map(item => (
                      <div 
                        key={item.id} 
                        className="glass-card" 
                        onClick={() => onPlayTrack(item, history)}
                        style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: '12px', cursor: 'pointer' }}
                      >
                        <img src={item.coverArt} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.artist}</span>
                          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '2px' }}>{formatPlayedAt(item.playedAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* VIEW: LIKED SONGS ONLY */}
          {activeFilter === 'liked' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.4rem', fontWeight: 700 }}>
                Liked Songs ({favorites.length})
              </h2>
              <div className="glass-panel" style={{ padding: '24px', minHeight: '300px' }}>
                {favorites.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No liked songs yet. Find tracks using Search and hit the Heart icon.</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                    {getSortedFavorites().map(track => {
                      const isCurrent = currentTrack && currentTrack.trackId === track.trackId;
                      return (
                        <div 
                          key={track.trackId} 
                          className="glass-card" 
                          onClick={() => onPlayTrack(track, favorites)}
                          style={{ 
                            padding: '14px', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            border: isCurrent ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.03)'
                          }}
                        >
                          <img src={track.coverArt} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                            <span style={{ fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: isCurrent ? 'var(--accent-purple)' : '#fff' }}>{track.title}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist}</span>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onToggleLike(track); }}
                            className="glass-btn-circle" 
                            style={{ width: '28px', height: '28px', border: 'none', background: 'rgba(255,255,255,0.05)' }}
                          >
                            <Heart size={12} fill="#fff" color="#fff" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW: PLAYLISTS SECTION */}
          {activeFilter === 'playlists' && (
            <div style={{ display: 'grid', gridTemplateColumns: selectedPlaylist ? '300px 1fr' : '1fr', gap: '24px' }}>
              
              {/* Left Column: List Playlists & Create Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Create New Playlist Card */}
                <div className="glass-panel" style={{ padding: '16px' }}>
                  <form onSubmit={handleCreatePlaylist} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Create Playlist</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div className="glass-input-container" style={{ flex: 1, padding: '4px 12px' }}>
                        <input 
                          type="text" 
                          placeholder="Playlist Name" 
                          value={newPlaylistName}
                          onChange={(e) => setNewPlaylistName(e.target.value)}
                          className="glass-input"
                          style={{ margin: 0 }}
                        />
                      </div>
                      <button type="submit" className="glass-btn active" style={{ padding: '8px 12px' }}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </form>
                </div>

                {/* Playlist Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {playlists.length === 0 ? (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '10px' }}>No playlists yet.</span>
                  ) : (
                    getSortedPlaylists().map(pl => {
                      const isOpened = selectedPlaylist && selectedPlaylist.id === pl.id;
                      const count = pl.tracks ? pl.tracks.length : 0;
                      return (
                        <div 
                          key={pl.id} 
                          className="glass-card"
                          onClick={() => setSelectedPlaylist(pl)}
                          style={{ 
                            padding: '12px 16px', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            border: isOpened ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.03)',
                            background: isOpened ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.015)'
                          }}
                        >
                          <div className="glass-panel" style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                            <Music size={16} style={{ opacity: 0.5 }} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pl.name}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{count} songs</span>
                          </div>
                          <button 
                            onClick={(e) => handleDeletePlaylist(pl.id, pl.name, e)}
                            className="glass-btn-circle" 
                            style={{ width: '28px', height: '28px', border: 'none', background: 'rgba(255, 0, 0, 0.05)', color: '#ff5b5b' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>

              </div>

              {/* Right Column: Playlist Details */}
              {selectedPlaylist && (
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.4rem', fontWeight: 800 }}>{selectedPlaylist.name}</h2>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{selectedPlaylist.tracks ? selectedPlaylist.tracks.length : 0} songs • Created: {new Date(selectedPlaylist.createdAt).toLocaleDateString()}</span>
                    </div>
                    <button onClick={() => setSelectedPlaylist(null)} className="glass-btn-circle" style={{ width: '28px', height: '28px', border: 'none' }}>
                      <X size={14} />
                    </button>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
                    {!selectedPlaylist.tracks || selectedPlaylist.tracks.length === 0 ? (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '20px 0' }}>Playlist is empty. Add songs from Search.</span>
                    ) : (
                      selectedPlaylist.tracks.map((track, idx) => {
                        const isCurrent = currentTrack && currentTrack.trackId === track.trackId;
                        return (
                          <div 
                            key={track.trackId}
                            className="glass-card"
                            onClick={() => onPlayTrack(track, selectedPlaylist.tracks)}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              padding: '8px 12px', 
                              gap: '12px', 
                              cursor: 'pointer',
                              border: isCurrent ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.03)'
                            }}
                          >
                            <span style={{ width: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{idx + 1}</span>
                            <img src={track.coverArt} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                            <div style={{ overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: isCurrent ? 'var(--accent-purple)' : '#fff' }}>{track.title}</span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist}</span>
                            </div>
                            <button 
                              onClick={(e) => handleRemoveTrack(track.trackId, e)}
                              className="glass-btn-circle" 
                              style={{ width: '26px', height: '26px', border: 'none', background: 'rgba(255,255,255,0.05)' }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* VIEW: LISTENING HISTORY */}
          {activeFilter === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.4rem', fontWeight: 700 }}>
                  Listening History ({history.length})
                </h2>
                {history.length > 0 && (
                  <button 
                    onClick={handleClearHistory}
                    className="glass-btn"
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: '0.75rem', 
                      border: '1px solid rgba(255, 107, 107, 0.25)', 
                      background: 'rgba(255, 107, 107, 0.05)',
                      color: '#ff6b6b' 
                    }}
                  >
                    <Trash2 size={12} />
                    <span>Clear History</span>
                  </button>
                )}
              </div>
              <div className="glass-panel" style={{ padding: '24px', minHeight: '300px' }}>
                {history.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Your listening history is empty. Play songs to populate history.</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                    {getSortedHistory().map(item => {
                      const isCurrent = currentTrack && currentTrack.trackId === item.trackId;
                      return (
                        <div 
                          key={item.id} 
                          className="glass-card" 
                          onClick={() => onPlayTrack(item, history)}
                          style={{ 
                            padding: '12px', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            border: isCurrent ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.03)'
                          }}
                        >
                          <img src={item.coverArt} style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }} />
                          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: isCurrent ? 'var(--accent-purple)' : '#fff' }}>{item.title}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.artist}</span>
                            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '2px' }}>Played: {item.playCount}x • {formatPlayedAt(item.playedAt)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
