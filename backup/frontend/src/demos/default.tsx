// src/demos/default.tsx
import React, { useState } from 'react';
import { YashmeenParallax } from '@/components/ui/yashmeen-parallax';
import { ParallaxComponent } from '@/components/ui/parallax-scrolling';

export default function ParallaxDemo() {
  const [activeTab, setActiveTab] = useState<'yashmeen' | 'osmo'>('yashmeen');

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', background: '#0d0d0c' }}>
      {/* View Switcher Floating Bar */}
      <div className="parallax-switcher">
        <button
          type="button"
          onClick={() => setActiveTab('yashmeen')}
          className={`parallax-switcher__btn ${activeTab === 'yashmeen' ? 'is-active' : ''}`}
        >
          Yashmeen Brand
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('osmo')}
          className={`parallax-switcher__btn ${activeTab === 'osmo' ? 'is-active' : ''}`}
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
