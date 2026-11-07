// src/demos/default.tsx
import React, { useState } from 'react';
import { YashmeenParallax } from '@/components/ui/yashmeen-parallax';
import { ParallaxComponent } from '@/components/ui/parallax-scrolling';

export default function ParallaxDemo() {
  const [activeTab, setActiveTab] = useState<'yashmeen' | 'osmo'>('yashmeen');

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', background: '#0d0d0c' }}>
      {/* View Switcher Floating Bar */}
      <div
        style={{
          position: 'fixed',
          top: '1.25rem',
          right: '1.5rem',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          background: 'rgba(27, 26, 23, 0.88)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(230, 225, 214, 0.18)',
          borderRadius: '9999px',
          padding: '0.35rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('yashmeen')}
          style={{
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            padding: '0.5rem 1.15rem',
            borderRadius: '9999px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            transition: 'all 0.25s ease',
            backgroundColor: activeTab === 'yashmeen' ? '#8a6a28' : 'transparent',
            color: activeTab === 'yashmeen' ? '#ffffff' : '#a8a29e'
          }}
        >
          Yashmeen Brand
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('osmo')}
          style={{
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            padding: '0.5rem 1.15rem',
            borderRadius: '9999px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            transition: 'all 0.25s ease',
            backgroundColor: activeTab === 'osmo' ? '#8a6a28' : 'transparent',
            color: activeTab === 'osmo' ? '#ffffff' : '#a8a29e'
          }}
        >
          21st.dev Reference
        </button>
      </div>

      {/* Active Parallax Experience */}
      {activeTab === 'yashmeen' ? (
        <YashmeenParallax />
      ) : (
        <>
          <ParallaxComponent />
          <div className="osmo-credits">
            <p className="osmo-credits__p">
              Resource by{' '}
              <a target="_blank" rel="noreferrer" href="https://www.osmo.supply/" className="osmo-credits__p-a">
                Osmo
              </a>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
