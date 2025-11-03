import React, { useState } from 'react';
import { generateDesignSystem } from '../services/geminiService';
import { marked } from 'marked';

const DesignSystem: React.FC = () => {
    const [designSystemMarkdown, setDesignSystemMarkdown] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setDesignSystemMarkdown(null);
        try {
            const result = await generateDesignSystem();
            setDesignSystemMarkdown(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        }
        setIsLoading(false);
    };

    const formattedContent = designSystemMarkdown ? marked.parse(designSystemMarkdown, { gfm: true, breaks: true }) : '';

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-[var(--glow-secondary)] mb-4 text-center" style={{ textShadow: '0 0 8px var(--glow-secondary)' }}>UI/UX Design System Generator</h2>
            <p className="text-center text-[var(--text-secondary)] mb-6 max-w-prose">
                Act as a product strategist and generate a comprehensive, modern design system for this application. The AI will provide core principles, color palettes, typography, and component wireframes to solve key UI/UX challenges.
            </p>
            {!designSystemMarkdown && !isLoading && (
                <button
                    onClick={handleGenerate}
                    className="btn-primary text-lg"
                >
                    Generate Design System
                </button>
            )}

            {isLoading && (
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--glow-primary)] mx-auto"></div>
                    <p className="mt-4 text-[var(--text-secondary)]">Generating your design system... This may take a moment.</p>
                </div>
            )}
            
            {error && <p className="text-[var(--glow-primary)]">Error: {error}</p>}

            {designSystemMarkdown && (
                <div className="w-full max-w-4xl mt-6 p-6 card-style">
                   <div 
                        className="prose prose-invert max-w-none prose-p:text-[var(--text-secondary)] prose-headings:text-[var(--glow-secondary)] prose-li:marker:text-[var(--glow-primary)] prose-strong:text-white prose-a:text-[var(--glow-primary)]" 
                        dangerouslySetInnerHTML={{ __html: formattedContent }} 
                    />
                </div>
            )}
        </div>
    );
};

export default DesignSystem;
