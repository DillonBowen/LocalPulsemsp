import React, { useState, useMemo } from 'react';
import { MOCK_OPPORTUNITIES } from '../constants';
import OpportunityCard from './OpportunityCard';
import { Opportunity, UrgencyLevel } from '../types';

const OpportunitiesFeed: React.FC = () => {
  const [opportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
  const [userSkills, setUserSkills] = useState<string>('Plumbing, Photography, Handyman, Furniture Assembly, Graphic Design');

  // Filter state
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel[]>(['Immediate', 'Within 24h']);
  const [minLegitimacy, setMinLegitimacy] = useState<number>(80);

  const filteredOpportunities = useMemo(() => {
    return opportunities
      .filter(opp => urgencyFilter.includes(opp.urgency))
      .filter(opp => opp.legitimacyScore >= minLegitimacy)
      .sort((a, b) => b.created_utc - a.created_utc);
  }, [opportunities, urgencyFilter, minLegitimacy]);
  
  const handleUrgencyChange = (urgency: UrgencyLevel) => {
    setUrgencyFilter(prev => 
      prev.includes(urgency) 
        ? prev.filter(u => u !== urgency)
        : [...prev, urgency]
    );
  };

  const UrgencyButton: React.FC<{urgency: UrgencyLevel}> = ({ urgency }) => (
    <button
      onClick={() => handleUrgencyChange(urgency)}
      className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 border-2 ${
        urgencyFilter.includes(urgency) 
          ? 'bg-[var(--glow-primary)] border-[var(--glow-primary)] text-white shadow-[0_0_8px_var(--glow-primary)]' 
          : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--glow-primary)] hover:text-white'
      }`}
    >
      {urgency}
    </button>
  );

  return (
    <div>
      <div className="mb-8 p-4 card-style">
        <h3 className="text-lg font-bold text-[var(--glow-secondary)] mb-3" style={{ textShadow: '0 0 5px var(--glow-secondary)'}}>User Profile & Filtering</h3>
        <div className="mb-4">
          <label htmlFor="userSkills" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Your Skills</label>
          <input
            id="userSkills"
            type="text"
            value={userSkills}
            onChange={(e) => setUserSkills(e.target.value)}
            placeholder="e.g., Plumbing, Graphic Design, Pet Sitting"
            className="w-full p-2 input-style"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Urgency</label>
            <div className="flex flex-wrap gap-2">
              <UrgencyButton urgency="Immediate" />
              <UrgencyButton urgency="Within 24h" />
              <UrgencyButton urgency="Flexible" />
              <UrgencyButton urgency="Ongoing" />
            </div>
          </div>
          <div>
            <label htmlFor="legitimacy" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Minimum Legitimacy: <span className="font-bold text-[var(--glow-primary)]">{minLegitimacy}%</span>
            </label>
            <input
              id="legitimacy"
              type="range"
              min="50"
              max="100"
              value={minLegitimacy}
              onChange={(e) => setMinLegitimacy(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-neon"
            />
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4 text-center">
        {filteredOpportunities.length} Matching Opportunities
      </h2>
      {filteredOpportunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} userSkills={userSkills} />
          ))}
        </div>
      ) : (
         <p className="text-center text-[var(--text-secondary)] mt-8">No opportunities match your current filters. Try adjusting your settings.</p>
      )}
    </div>
  );
};

export default OpportunitiesFeed;
