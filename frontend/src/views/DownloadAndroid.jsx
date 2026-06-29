import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function DownloadAndroid() {
  const [downloadStarted, setDownloadStarted] = useState(false);

  const handleDownloadClick = () => {
    setDownloadStarted(true);
    // Trigger direct file download
    const link = document.createElement('a');
    link.href = '/rampx.apk';
    link.download = 'RampX.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="glass-btn-circle" style={{ width: '48px', height: '48px', border: 'none', background: 'rgba(255, 255, 255, 0.05)' }}>
          <Smartphone size={24} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '2rem', fontWeight: 800 }}>
            RampX for Android
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Portable high-fidelity music streaming, direct to your pocket.
          </p>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)' }} />

      {/* Main Grid: Thank You and Download Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Thank You Card */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '30px', 
            background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.4) 0%, rgba(2, 2, 4, 0.5) 100%)',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap'
          }}
        >
          <div className="glass-btn-circle" style={{ width: '60px', height: '60px', background: '#fff', color: '#000', border: 'none', flexShrink: 0 }}>
            <HeartHandshake size={30} fill="#000" />
          </div>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>
              Thank You for Choosing RampX!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              We are excited to bring you a fluid, zero-cost, ad-free listening experience. By downloading the application, you support independent, platform-independent client wrappers built for high performance.
            </p>
          </div>
        </div>

        {/* Terms & Conditions Scrollable Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Terms & Conditions
          </span>
          <div 
            className="glass-panel" 
            style={{ 
              padding: '20px', 
              maxHeight: '160px', 
              overflowY: 'auto', 
              fontSize: '0.82rem', 
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid rgba(255,255,255,0.04)'
            }}
          >
            <p style={{ fontWeight: 600, marginBottom: '8px', color: '#fff' }}>RAMPX END USER LICENSE AGREEMENT (EULA)</p>
            <p style={{ marginBottom: '12px' }}>
              1. **Educational & Fair Use Disclaimer**: RampX is an open-source, zero-revenue client player wrapper. We do not host, store, or sell any copyright-protected audio files. All music is resolved dynamically on-demand using public APIs and scraped search indexers.
            </p>
            <p style={{ marginBottom: '12px' }}>
              2. **Personal Non-Commercial Use Only**: By downloading and using this APK or PWA shortcut, you agree to use the service solely for private, non-commercial entertainment purposes. Any commercial exploitation of RampX is strictly prohibited.
            </p>
            <p style={{ marginBottom: '12px' }}>
              3. **Liability Limitation**: The developers of RampX are not liable for any third-party content resolved by indexers, nor are they responsible for internet charges or offline cache consumption on your mobile device.
            </p>
            <p style={{ marginBottom: '12px' }}>
              4. **Privacy Policy**: RampX runs fully client-side and interacts only with your local database to manage play histories and playlists. No user metadata, history logs, or account info are gathered or forwarded to external servers.
            </p>
            <p>
              By proceeding with the download, you acknowledge that you have read, understood, and agreed to the EULA terms listed above.
            </p>
          </div>
        </div>

        {/* Download Buttons Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flexWrap: 'wrap' }}>
          
          {/* Direct APK Box */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.015)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Download size={18} color="var(--accent-pink)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Direct APK File</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Download and install the standalone package. You may need to enable "Install from Unknown Sources" in your device settings.
            </p>
            <button 
              onClick={handleDownloadClick}
              className="glass-btn active"
              style={{ width: '100%', marginTop: 'auto', gap: '10px' }}
            >
              <Download size={16} />
              <span>Download APK</span>
            </button>

            {downloadStarted && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff6b6b', fontSize: '0.78rem', marginTop: '4px', justifyContent: 'center' }}>
                <CheckCircle size={14} color="#ff6b6b" />
                <span>Downloading started! Check your downloads folder.</span>
              </div>
            )}
          </div>

          {/* Secure PWA Box */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.015)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={18} color="var(--accent-purple)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Secure PWA Install</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Install directly from your browser! Faster, runs sandboxed without warning popups, and updates automatically.
            </p>
            <div 
              style={{ 
                background: 'rgba(255, 255, 255, 0.02)', 
                border: 'var(--glass-border)', 
                padding: '8px 12px', 
                borderRadius: '8px',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                lineHeight: '1.4',
                marginTop: 'auto'
              }}
            >
              Open Chrome on Android ➔ Tap the three-dot Menu ➔ Select <strong>Add to Home screen</strong>. Done!
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
