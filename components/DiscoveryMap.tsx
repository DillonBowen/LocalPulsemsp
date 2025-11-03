import React, { useState } from 'react';
import { generateDiscoveryMap } from '../services/geminiService';
import { DiscoveryMapData } from '../types';

const Accordion: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-[var(--border-color)] rounded-lg mb-2 bg-[var(--bg-card-solid)]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left p-3 hover:bg-[rgba(28,25,41,0.9)] font-semibold flex justify-between items-center"
            >
                {title}
                <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {isOpen && <div className="p-3 border-t border-[var(--border-color)]">{children}</div>}
        </div>
    );
};

const KeywordTags: React.FC<{ keywords: string[], color?: string }> = ({ keywords, color = 'var(--bg-card-solid)' }) => (
    <div className="flex flex-wrap gap-2">
        {keywords.map(kw => <span key={kw} className="text-gray-200 text-xs font-medium px-2.5 py-1 rounded-full" style={{backgroundColor: color}}>{kw}</span>)}
    </div>
);


const DiscoveryMap: React.FC = () => {
    const [data, setData] = useState<DiscoveryMapData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setData(null);
        try {
            const result = await generateDiscoveryMap();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        }
        setIsLoading(false);
    };
    
    const renderSources = () => data && (
        <div className="p-4 card-style">
            <h3 className="text-xl font-bold text-[var(--glow-secondary)] mb-4">Data Sources</h3>
            <Accordion title={`Tier 1: Established (${data.data_sources.tier_1_established.length})`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-[var(--text-secondary)] uppercase bg-[var(--bg-card-solid)]">
                            <tr><th className="px-4 py-2">Source</th><th className="px-4 py-2">Priority</th><th className="px-4 py-2">Notes</th></tr>
                        </thead>
                        <tbody>
                            {data.data_sources.tier_1_established.map(s => <tr key={s.source_name} className="border-b border-[var(--border-color)]"><td className="px-4 py-2 font-medium"><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[var(--glow-secondary)] hover:underline">{s.source_name}</a></td><td className="px-4 py-2">{s.integration_priority}</td><td className="px-4 py-2 text-[var(--text-secondary)]">{s.notes}</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </Accordion>
            <Accordion title={`Tier 2: Niche (${data.data_sources.tier_2_niche.length})`}>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                         <thead className="text-xs text-[var(--text-secondary)] uppercase bg-[var(--bg-card-solid)]">
                            <tr><th className="px-4 py-2">Source</th><th className="px-4 py-2">Priority</th><th className="px-4 py-2">Notes</th></tr>
                        </thead>
                        <tbody>
                            {data.data_sources.tier_2_niche.map(s => <tr key={s.source_name} className="border-b border-[var(--border-color)]"><td className="px-4 py-2 font-medium"><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[var(--glow-secondary)] hover:underline">{s.source_name}</a></td><td className="px-4 py-2">{s.integration_priority}</td><td className="px-4 py-2 text-[var(--text-secondary)]">{s.notes}</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </Accordion>
        </div>
    );

    const renderKeywords = () => data && (
        <div className="p-4 card-style">
            <h3 className="text-xl font-bold text-[var(--glow-secondary)] mb-4">Keyword Intelligence</h3>
            <Accordion title="High-Intent Keywords">
                 {Object.entries(data.keyword_intelligence.high_intent_keywords).map(([category, subcategories]) => (
                    <div key={category} className="mb-3">
                        <h4 className="font-bold text-white capitalize mb-2">{category.replace(/_/g, ' ')}</h4>
                        {Array.isArray(subcategories) 
                            ? <KeywordTags keywords={subcategories} />
                            : Object.entries(subcategories).map(([sub, keywords]) => (
                                <div key={sub} className="ml-4 mb-2">
                                    <h5 className="text-sm font-semibold text-[var(--text-secondary)] capitalize mb-1">{sub.replace(/_/g, ' ')}</h5>
                                    {/* FIX: Add type assertion because TypeScript infers `keywords` as `{}`, not `string[]`, when iterating over an object with a generic index signature. */}
                                    <KeywordTags keywords={keywords as string[]} />
                                </div>
                            ))
                        }
                    </div>
                ))}
            </Accordion>
            <Accordion title="Negative Keywords">
                {Object.entries(data.keyword_intelligence.negative_keywords).map(([category, keywords]) => (
                    <div key={category} className="mb-3">
                        <h4 className="font-bold text-[var(--glow-primary)] capitalize mb-2">{category.replace(/_/g, ' ')}</h4>
                        <KeywordTags keywords={keywords} color={`${'var(--glow-primary)'}30`} />
                    </div>
                ))}
            </Accordion>
        </div>
    );
    
    const renderRoadmap = () => data && (
         <div className="p-4 card-style">
             <h3 className="text-xl font-bold text-[var(--glow-secondary)] mb-4">Implementation Roadmap</h3>
             <div className="space-y-4">
                 {data.implementation_roadmap.map(phase => (
                     <div key={phase.phase} className="p-3 bg-[var(--bg-card-solid)] rounded-md border border-[var(--border-color)]">
                         <h4 className="font-bold text-lg text-white">Phase {phase.phase} <span className="text-sm font-medium text-[var(--text-secondary)] capitalize">- {phase.priority}</span></h4>
                         <p className="text-sm text-[var(--text-primary)] mt-1">{phase.sources_to_add[0]}</p>
                         <p className="text-sm text-[var(--text-primary)] mt-1">{phase.keywords_to_add[0]}</p>
                         <div className="text-xs mt-2 text-[var(--text-secondary)] flex justify-between">
                            <span>Effort: {phase.estimated_effort}</span>
                            <span>Impact: {phase.expected_lead_increase || phase.expected_noise_reduction || phase.expected_lead_quality_improvement}</span>
                         </div>
                     </div>
                 ))}
             </div>
         </div>
    );


    return (
        <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-[var(--glow-secondary)] mb-4 text-center" style={{ textShadow: '0 0 8px var(--glow-secondary)' }}>Local Discovery Map</h2>
            <p className="text-center text-[var(--text-secondary)] mb-6 max-w-prose">
                Generate an enterprise-grade market intelligence report to discover new data sources, refine keywords, and enhance your lead filtering strategy for the Minneapolis-St. Paul area.
            </p>
            {!data && !isLoading && (
                <button
                    onClick={handleGenerate}
                    className="btn-primary text-lg"
                >
                    Generate Discovery Map
                </button>
            )}

            {isLoading && (
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--glow-primary)] mx-auto"></div>
                    <p className="mt-4 text-[var(--text-secondary)]">Generating your report... This may take a moment.</p>
                </div>
            )}
            
            {error && <p className="text-[var(--glow-primary)]">Error: {error}</p>}

            {data && (
                <div className="w-full max-w-5xl mt-6 space-y-6">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {renderSources()}
                        {renderKeywords()}
                   </div>
                   {renderRoadmap()}
                </div>
            )}
        </div>
    );
};

export default DiscoveryMap;