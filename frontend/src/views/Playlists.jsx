import React, { useState, useEffect } from 'react';
import { Play, Plus, Trash2, Music, X, Calendar } from 'lucide-react';

export default function Playlists({ onPlayTrack, currentTrack }) {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null); // Playlist object currently opened

  const fetchPlaylists = async () => {
    try {
      const res = await fetch('/api/library/playlists');
      if (res.ok) {
        const data = await res.json();
        setPlaylists(data);
        
        // If a playlist is selected, update it too
        if (selectedPlaylist) {
          const updated = data.find(p => p.id === selectedPlaylist.id);
          setSelectedPlaylist(updated || null);
        }
      }
    } catch (e) {
      console.error("Error loading playlists", e);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

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
      const res = await fetch(`/api/library/playlists/${id}`, {
        method: 'DELETE'
      });
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
            Your Playlists
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Organize your listening sessions. Create, edit, and play custom mixes.
          </p>
        </div>

        {/* Create playlist form */}
        <form onSubmit={handleCreatePlaylist} style={{ display: 'flex', gap: '10px' }}>
          <div className="glass-input-container" style={{ width: '220px', padding: '6px 14px' }}>
            <input 
              type="text" 
              placeholder="New Playlist Name" 
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="glass-input"
              style={{ margin: 0 }}
            />
          </div>
          <button type="submit" className="glass-btn active" style={{ height: '38px', borderRadius: '30px' }}>
            <Plus size={16} />
            <span>Create</span>
          </button>
        </form>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)' }} />

      {/* Main Area: Split between Playlist List and Playlist Track Details */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedPlaylist ? '300px 1fr' : '1fr', gap: '24px', transition: 'all 0.3s ease' }}>
        
        {/* Left/Main Column: Playlists List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {playlists.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', gap: '12px' }}>
              <Music size={40} style={{ opacity: 0.3 }} />
              <span>Create your first playlist above to get started</span>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: selectedPlaylist ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))', 
              gap: '16px' 
            }}>
              {playlists.map((pl) => {
                const isOpened = selectedPlaylist && selectedPlaylist.id === pl.id;
                const trackCount = pl.tracks ? pl.tracks.length : 0;
                // Use first song art as playlist cover, else placeholder
                const playlistCover = pl.tracks && pl.tracks.length > 0 ? pl.tracks[0].coverArt : null;

                return (
                  <div 
                    key={pl.id} 
                    className="glass-card"
                    onClick={() => setSelectedPlaylist(pl)}
                    style={{ 
                      padding: '16px', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      background: isOpened ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      border: isOpened ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    {playlistCover ? (
                      <img 
                        src={playlistCover} 
                        alt={pl.name} 
                        style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="glass-panel" style={{ width: '56px', height: '56px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                        <Music size={22} style={{ opacity: 0.5 }} />
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                      <span style={{ fontWeight: 600, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {pl.name}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {trackCount} {trackCount === 1 ? 'song' : 'songs'}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => handleDeletePlaylist(pl.id, pl.name, e)}
                      className="glass-btn-circle" 
                      style={{ width: '32px', height: '32px', border: 'none', background: 'rgba(255,0,127,0.05)', color: 'rgba(255,255,255,0.7)' }}
                      title="Delete playlist"
                    >
                      <Trash2 size={13} color="var(--accent-pink)" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Songs inside Selected Playlist */}
        {selectedPlaylist && (
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(255,255,255,0.015)' }}>
            
            {/* Playlist Detail Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
                  {selectedPlaylist.name}
                </h2>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> 
                    Created: {new Date(selectedPlaylist.createdAt).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>{selectedPlaylist.tracks ? selectedPlaylist.tracks.length : 0} tracks</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPlaylist(null)}
                className="glass-btn-circle" 
                style={{ width: '32px', height: '32px', border: 'none' }}
                title="Close panel"
              >
                <X size={15} />
              </button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)' }} />

            {/* Playlist Songs List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '450px', overflowY: 'auto' }}>
              {!selectedPlaylist.tracks || selectedPlaylist.tracks.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
                  This playlist is empty. Search for songs and click "+" to add them.
                </div>
              ) : (
                selectedPlaylist.tracks.map((track, index) => {
                  const isCurrent = currentTrack && currentTrack.trackId === track.trackId;
                  return (
                    <div 
                      key={track.trackId}
                      className="glass-card"
                      onClick={() => onPlayTrack(track, selectedPlaylist.tracks)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px 16px',
                        gap: '16px',
                        cursor: 'pointer',
                        background: isCurrent ? 'rgba(157, 78, 221, 0.08)' : 'rgba(255,255,255,0.01)',
                        border: isCurrent ? '1px solid rgba(157, 78, 221, 0.25)' : '1px solid rgba(255,255,255,0.04)'
                      }}
                    >
                      <span style={{ width: '20px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                        {index + 1}
                      </span>
                      <img 
                        src={track.coverArt || 'https://via.placeholder.com/50'} 
                        alt={track.title} 
                        style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                        <span style={{ 
                          fontWeight: 600, 
                          fontSize: '0.9rem', 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          color: isCurrent ? 'var(--accent-purple)' : '#fff'
                        }}>
                          {track.title}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {track.artist}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: '40px', textAlign: 'right' }}>
                        {track.duration}
                      </span>
                      <button 
                        onClick={(e) => handleRemoveTrack(track.trackId, e)}
                        className="glass-btn-circle" 
                        style={{ width: '28px', height: '28px', border: 'none', background: 'transparent' }}
                        title="Remove from playlist"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
