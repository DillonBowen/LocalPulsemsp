import React, { useState } from 'react';
import { Opportunity, EnrichedOpportunity, DraftedResponse } from '../types';
import { enrichOpportunity, findOnMap, draftResponse } from '../services/geminiService';
import { marked } from 'marked';

interface OpportunityCardProps {
  opportunity: Opportunity;
  userSkills: string;
}

const formatEnrichedDataToMarkdown = (data: EnrichedOpportunity): string => {
  let markdown = `## 💎 Lead Enrichment Report\n\n`;

  markdown += `### Vitals\n`;
  markdown += `- **Category**: ${data.gig_category || 'N/A'} > ${data.gig_subcategory || 'N/A'}\n`;
  markdown += `- **Urgency**: ${data.urgency_level || 'N/A'} (${data.urgency_deadline || 'not specified'})\n`;
  markdown += `- **Response Priority**: **${data.response_priority?.toUpperCase() || 'N/A'}** - _${data.priority_reasoning || 'No reasoning provided.'}_\n`;
  markdown += `- **Overall Value Score**: **${data.value_score}/100** - _${data.value_reasoning || 'No reasoning provided.'}_\n\n`;

  markdown += `### Legitimacy Assessment (Confidence: ${data.legitimacy_assessment.confidence_level})\n`;
  markdown += `- **Score**: ${data.legitimacy_assessment.score}/100\n`;
  markdown += `- **Scam Probability**: ${data.legitimacy_assessment.scam_probability}\n`;
  if (data.legitimacy_assessment.green_flags?.length > 0) {
    markdown += `- **✅ Green Flags**: ${data.legitimacy_assessment.green_flags.join(', ')}\n`;
  }
  if (data.legitimacy_assessment.red_flags?.length > 0) {
    markdown += `- **🚩 Red Flags**: ${data.legitimacy_assessment.red_flags.join(', ')}\n`;
  }
  markdown += `- **Reasoning**: ${data.legitimacy_assessment.reasoning}\n\n`;
  
  markdown += `### Budget & Payment\n`;
  markdown += `- **Mentioned**: ${data.budget.mentioned ? 'Yes' : 'No'}\n`;
  if (data.budget.mentioned || data.budget.estimated) {
     markdown += `- **Range**: $${data.budget.min_amount || '?'} - $${data.budget.max_amount || '?'}\n`;
     markdown += `- **Payment Type**: ${data.budget.payment_type || 'N/A'}\n`;
  }
  if (data.budget.estimated) {
     markdown += `- **Note**: This budget is an estimate (Confidence: ${data.budget.estimation_confidence})\n\n`;
  }

  markdown += `### Skills & Requirements\n`;
  markdown += `- **Required Skills**: ${data.required_skills?.join(', ') || 'None specified'}\n`;
  markdown += `- **Required Level**: ${data.skill_level_required || 'Any'}\n`;
  if (data.deal_breakers?.length > 0) {
    markdown += `- **Deal Breakers**: ${data.deal_breakers.join(', ')}\n`;
  }
  markdown += `\n`;
  
  markdown += `### Suggested Next Steps\n`;
  data.suggested_next_actions?.forEach(action => {
      markdown += `- ${action}\n`;
  });

  return markdown;
};

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, userSkills }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [modalContent, setModalContent] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [showCopyButton, setShowCopyButton] = useState(false);
  const [copyContent, setCopyContent] = useState('');
  const [cardState, setCardState] = useState<'active' | 'responded' | 'dismissed'>('active');

  const handleAnalyze = async () => {
    setIsLoading(true);
    setShowCopyButton(false);
    setModalTitle("In-Depth Gig Analysis");
    setModalContent("<div class='text-center'>Enriching lead with Gemini Pro...<br/>Please wait, this may take a moment.</div>");
    try {
        const result = await enrichOpportunity(opportunity.title, opportunity.snippet);
        const formattedResult = formatEnrichedDataToMarkdown(result);
        setModalContent(formattedResult);
    } catch (error) {
        setModalContent("An error occurred during analysis. Please try again.");
    }
    setIsLoading(false);
  };

  const handleDraftResponse = async () => {
    setIsLoading(true);
    setShowCopyButton(true);
    setModalTitle("AI-Drafted Response");
    setModalContent("<div class='text-center'>Drafting response options with Gemini Flash...</div>");
    try {
        const result: DraftedResponse = await draftResponse(opportunity, userSkills);
        const recommended = result.recommended_tone === 'casual' ? result.casual : result.formal;
        setCopyContent(recommended);
        
        const responseMarkdown = `
        ### Recommended Tone: ${result.recommended_tone.charAt(0).toUpperCase() + result.recommended_tone.slice(1)}
        ---
        **${result.recommended_tone === 'formal' ? '✅' : ''} Formal Response:**
        <div class="p-3 my-2 bg-[var(--bg-dark)] rounded-lg border border-[var(--border-color)]">${result.formal}</div>
        
        **${result.recommended_tone === 'casual' ? '✅' : ''} Casual Response:**
        <div class="p-3 my-2 bg-[var(--bg-dark)] rounded-lg border border-[var(--border-color)]">${result.casual}</div>
        `;
        setModalContent(responseMarkdown);

    } catch (error) {
        setModalContent("An error occurred while drafting the response. Please try again.");
        setShowCopyButton(false);
    }
    setIsLoading(false);
  };
  
  const closeModal = () => {
    setModalContent(null);
  };

  const handleCopyToClipboard = () => {
    if (copyContent) {
        navigator.clipboard.writeText(copyContent).then(() => {
            alert('Recommended response copied to clipboard!');
        });
    }
  };

  const formattedModalContent = modalContent ? marked.parse(modalContent, { gfm: true, breaks: true }) : '';

  const isHighPriority = opportunity.urgency === 'Immediate' && opportunity.legitimacyScore > 80 && opportunity.skillMatch > 80;

  const cardClasses = {
    active: "hover:scale-[1.03]",
    responded: "opacity-50",
    dismissed: "opacity-50",
  }[cardState];

  const urgencyStyle = {
    'Immediate': { color: '#FF3B30', shadow: '0 0 8px #FF3B30' },
    'Within 24h': { color: '#FF9500', shadow: '0 0 8px #FF9500' },
    'Flexible': { color: '#34C759', shadow: '0 0 8px #34C759' },
    'Ongoing': { color: '#00E0FF', shadow: '0 0 8px #00E0FF' },
  }[opportunity.urgency];

  const formatBudget = () => {
    if (!opportunity.budget) return "Not specified";
    const { min, max, type } = opportunity.budget;
    if (min && max) return `$${min}-$${max}${type === 'hourly' ? '/hr' : ''}`;
    if (min) return `~$${min}${type === 'hourly' ? '/hr' : ''}`;
    return "Budgeted";
  }

  return (
    <>
      <div 
        className={`card-style p-4 flex flex-col justify-between transition-all duration-300 transform ${cardClasses} ${isHighPriority && cardState === 'active' ? 'shadow-[0_0_25px_var(--glow-secondary)]' : ''}`}
        style={{ minHeight: '320px' }}
      >
        <div>
          <div className="flex justify-between items-start mb-3">
             <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded-full`} style={{ color: urgencyStyle.color, backgroundColor: `${urgencyStyle.color}20`, textShadow: urgencyStyle.shadow }}>{opportunity.urgency}</span>
                <span className="text-xs font-semibold bg-[var(--bg-card-solid)] text-[var(--glow-secondary)] px-2 py-1 rounded-full">{opportunity.category}</span>
             </div>
             <a href={opportunity.permalink} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--text-secondary)] hover:text-white">View Post &rarr;</a>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{opportunity.title}</h3>
          
          <div className="grid grid-cols-3 gap-2 text-center my-4 text-xs">
            <div>
                <div className="font-bold uppercase tracking-wider" style={{color: 'var(--glow-primary)'}}>Budget</div>
                <div className="text-white font-semibold text-sm">{formatBudget()}</div>
            </div>
            <div>
                <div className="font-bold uppercase tracking-wider" style={{color: 'var(--glow-secondary)'}}>Legitimacy</div>
                <div className="text-white font-semibold text-sm">{opportunity.legitimacyScore}%</div>
            </div>
            <div>
                <div className="font-bold uppercase tracking-wider" style={{color: '#A855F7'}}>Skill Match</div>
                <div className="text-white font-semibold text-sm">{opportunity.skillMatch}%</div>
            </div>
          </div>

          <p className="text-sm text-[var(--text-secondary)] mb-4 h-16 overflow-y-auto">{opportunity.snippet}</p>
        </div>

        {cardState === 'active' ? (
             <div className="border-t border-[var(--border-color)] pt-3 flex flex-wrap gap-2 justify-between items-center">
                 <div>
                     <button onClick={() => setCardState('responded')} className="text-xs hover:bg-green-800/50 text-green-300 font-bold py-1 px-2 rounded-md transition-colors">Responded</button>
                     <button onClick={() => setCardState('dismissed')} className="text-xs hover:bg-red-800/50 text-red-300 font-bold py-1 px-2 rounded-md transition-colors">Dismiss</button>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={handleDraftResponse} disabled={isLoading} className="text-xs bg-[var(--glow-secondary)] hover:scale-105 text-[var(--bg-dark)] font-bold py-2 px-3 rounded-md disabled:opacity-50 transition-transform">Draft</button>
                    <button onClick={handleAnalyze} disabled={isLoading} className="text-xs bg-[var(--glow-primary)] hover:scale-105 text-white font-bold py-2 px-3 rounded-md disabled:opacity-50 transition-transform">Analyze</button>
                 </div>
            </div>
        ) : (
             <div className="border-t border-[var(--border-color)] pt-3 flex justify-center items-center">
                <p className="text-sm font-bold text-[var(--text-secondary)]">{cardState === 'responded' ? 'Marked as Responded' : 'Dismissed'}</p>
                 <button onClick={() => setCardState('active')} className="text-xs ml-2 hover:text-white text-[var(--text-secondary)]">Undo</button>
            </div>
        )}
      </div>
      
      {modalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="card-style max-w-2xl w-full max-h-[90vh] flex flex-col">
            <h3 className="text-xl font-bold text-white p-4 border-b border-[var(--border-color)]" style={{ textShadow: '0 0 8px var(--glow-secondary)' }}>{modalTitle}</h3>
            <div className="p-6 overflow-y-auto">
              <div className="prose prose-invert max-w-none prose-p:text-[var(--text-secondary)] prose-headings:text-white" dangerouslySetInnerHTML={{ __html: formattedModalContent }} />
            </div>
            <div className="border-t border-[var(--border-color)] p-3 rounded-b-lg flex gap-2">
                {showCopyButton && !isLoading && (
                    <button onClick={handleCopyToClipboard} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors">Copy Recommended</button>
                )}
                <button onClick={closeModal} disabled={isLoading} className="w-full btn-secondary">
                    {isLoading ? 'Loading...' : 'Close'}
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OpportunityCard;
