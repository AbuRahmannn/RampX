import React from 'react';
import { Home, Search, ListMusic, History, Headphones, Smartphone } from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView }) {
  const menuItems = [
    { id: 'home', name: 'Home', icon: Home },
    { id: 'search', name: 'Search', icon: Search },
    { id: 'playlists', name: 'Playlists', icon: ListMusic },
    { id: 'library', name: 'History & Faves', icon: History },
    { id: 'download', name: 'Download for Android', icon: Smartphone }
  ];

  return (
    <div className="sidebar-area glass-panel" style={{ padding: '24px', gap: '30px', display: 'flex', flexDirection: 'column' }}>
      {/* App Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
        <div className="glass-btn-circle" style={{ background: 'var(--accent-purple)', border: 'none', cursor: 'default', boxShadow: '0 0 15px var(--accent-purple-glow)' }}>
          <Headphones size={22} color="#fff" />
        </div>
        <h2 style={{ 
          fontFamily: 'var(--font-family-heading)', 
          fontSize: '1.6rem', 
          fontWeight: 800, 
          letterSpacing: '1px',
          background: 'linear-gradient(45deg, #ffffff, #cda7ff)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 20px rgba(157, 78, 221, 0.15)'
        }}>
          RampX
        </h2>
      </div>

      {/* Navigation Options */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`glass-btn ${isActive ? 'active' : ''}`}
              style={{
                justifyContent: 'flex-start',
                padding: '14px 20px',
                width: '100%',
                fontSize: '1.05rem',
                border: isActive ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.04)',
                boxShadow: isActive ? '0 4px 15px rgba(157, 78, 221, 0.25)' : 'none'
              }}
            >
              <Icon size={20} style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.7)' }} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
        RampX Client v1.0
      </div>
    </div>
  );
}
