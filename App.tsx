import React, { useState } from 'react';
import Header from './components/Header';
import OpportunitiesFeed from './components/OpportunitiesFeed';
import ImageAnalyzer from './components/ImageAnalyzer';
import ImageGenerator from './components/ImageGenerator';
import ChatBot from './components/ChatBot';
import DiscoveryMap from './components/DiscoveryMap';
import DesignSystem from './components/DesignSystem';
import { Tab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Opportunities);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.Opportunities:
        return <OpportunitiesFeed />;
      case Tab.AnalyzeImage:
        return <ImageAnalyzer />;
      case Tab.GenerateImage:
        return <ImageGenerator />;
      case Tab.Chat:
        return <ChatBot />;
      case Tab.Discovery:
        return <DiscoveryMap />;
      case Tab.DesignSystem:
        return <DesignSystem />;
      default:
        return <OpportunitiesFeed />;
    }
  };

  const NavButton: React.FC<{ tab: Tab; label: string }> = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm md:text-base font-bold rounded-lg transition-all duration-300 transform hover:scale-105 ${
        activeTab === tab
          ? 'bg-[var(--glow-primary)] text-white shadow-[0_0_15px_var(--glow-primary)]'
          : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(28,25,41,0.9)]'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-6">
        <nav className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-8">
          <NavButton tab={Tab.Opportunities} label="Opportunities" />
          <NavButton tab={Tab.AnalyzeImage} label="Analyze Image" />
          <NavButton tab={Tab.GenerateImage} label="Generate Image" />
          <NavButton tab={Tab.Chat} label="Chat with AI" />
          <NavButton tab={Tab.Discovery} label="Discovery Map" /> 
          <NavButton tab={Tab.DesignSystem} label="Design System" /> 
        </nav>
        <div className="card-style p-4 md:p-6 min-h-[60vh]">
          {renderContent()}
        </div>
      </main>
      <footer className="text-center py-4 text-[var(--text-secondary)] text-sm">
        <p>LocalPulse MSP &copy; 2024. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
