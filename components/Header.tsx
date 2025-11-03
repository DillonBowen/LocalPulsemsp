import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center py-8">
      <h1 className="text-4xl md:text-5xl font-extrabold text-white" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3), 0 0 20px var(--glow-secondary)' }}>
        LocalPulse <span style={{ color: 'var(--glow-secondary)', textShadow: '0 0 10px var(--glow-secondary), 0 0 20px var(--glow-secondary)'}}>MSP</span>
      </h1>
      <p className="text-[var(--text-secondary)] mt-2 text-sm md:text-base tracking-wider">
        Your AI-Powered Guide to Gigs in the Twin Cities
      </p>
    </header>
  );
};

export default Header;
