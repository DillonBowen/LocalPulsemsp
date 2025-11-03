export type UrgencyLevel = 'Immediate' | 'Within 24h' | 'Flexible' | 'Ongoing';

export interface Opportunity {
  id: string;
  title: string;
  subreddit: string;
  author: string;
  created_utc: number;
  permalink: string;
  snippet: string;
  category: string;
  urgency: UrgencyLevel;
  budget?: {
    min?: number;
    max?: number;
    type: 'hourly' | 'fixed';
  };
  legitimacyScore: number; // 0-100
  skillMatch: number; // 0-100
}

export enum Tab {
  Opportunities = 'opportunities',
  AnalyzeImage = 'analyze-image',
  GenerateImage = 'generate-image',
  Chat = 'chat',
  Discovery = 'discovery',
  DesignSystem = 'design-system',
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}


// --- START: New types for Lead Triage & Qualification Engine ---

export interface DraftedResponse {
  formal: string;
  casual: string;
  recommended_tone: 'formal' | 'casual';
}

export interface EnrichedOpportunity {
  enrichment_version: string;
  processed_at: string; // ISO 8601 timestamp
  gig_category: string | null;
  gig_subcategory: string | null;
  urgency_level: 'immediate' | 'within_24h' | 'within_week' | 'flexible' | 'ongoing' | null;
  urgency_deadline: string | null;
  budget: {
    mentioned: boolean;
    min_amount: number | null;
    max_amount: number | null;
    currency: 'USD' | 'other' | null;
    payment_type: 'cash' | 'check' | 'venmo' | 'paypal' | 'platform' | 'negotiable' | null;
    estimated: boolean;
    estimation_confidence: 'high' | 'medium' | 'low' | null;
  };
  location: {
    city: string | null;
    neighborhood: string | null;
    zip_code: string | null;
    state: string | null;
    address_provided: boolean;
    specificity_score: number; // 0-100
    normalized_location: string | null;
  };
  legitimacy_assessment: {
    score: number; // 0-100
    red_flags: string[];
    green_flags: string[];
    confidence_level: 'high' | 'medium' | 'low';
    reasoning: string;
    scam_probability: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  };
  contact_info: {
    method: 'email' | 'phone' | 'platform_message' | 'not_specified' | null;
    extracted_email: string | null;
    extracted_phone: string | null;
    preferred_contact: string | null;
    contact_visibility: 'public' | 'private' | 'unclear';
  };
  required_skills: string[];
  skill_level_required: 'beginner' | 'intermediate' | 'expert' | 'any' | null;
  job_description_summary: string;
  key_requirements: string[];
  deal_breakers: string[];
  sentiment: 'desperate' | 'casual' | 'professional' | 'frustrated' | 'neutral' | null;
  poster_type: 'homeowner' | 'business' | 'property_manager' | 'individual' | 'unclear' | null;
  response_priority: 'high' | 'medium' | 'low';
  priority_reasoning: string;
  estimated_duration: string | null;
  estimated_effort: 'quick_task' | 'half_day' | 'full_day' | 'multi_day' | 'ongoing' | null;
  competition_level: 'high' | 'medium' | 'low';
  competition_reasoning: string;
  response_window: string | null;
  pre_drafted_response: DraftedResponse;
  suggested_next_actions: string[];
  questions_to_ask: string[];
  value_score: number; // 0-100
  value_reasoning: string;
  tags: string[];
  similar_gigs_indicator: string | null;
}
// --- END: New types for Lead Triage & Qualification Engine ---


// --- START: New types for Discovery Map ---
interface DataSource {
  platform: string;
  source_name: string;
  url: string;
  category_relevance: string[];
  estimated_volume: string;
  api_available: boolean;
  update_frequency: string;
  legitimacy_score: number;
  integration_priority: string;
  notes: string;
  seasonal_patterns?: string;
  implementation_difficulty?: string;
}

interface LocalForumSource {
  type: string;
  examples: string[];
  category_relevance: string[];
  discovery_method: string;
  estimated_sources: string;
  integration_priority: string;
  notes: string;
}

interface FacebookGroupSource {
  search_query: string;
  group_type: string;
  category_relevance: string[];
  estimated_count: string;
  access_method: string;
  posting_frequency: string;
  integration_priority: string;
  privacy_note: string;
}

interface NextdoorStrategy {
  available: boolean;
  coverage: string;
  api_available: boolean;
  scraping_feasibility: string;
  alternative_approach: string;
  search_query: string;
  integration_priority: string;
  notes: string;
}

interface CraigslistOptimization {
  current_sections: string[];
  recommended_additional: string[];
  posting_patterns: string;
  update_frequency: string;
  geographical_coverage: string[];
  integration_priority: string;
}

interface HighIntentKeywords {
  creative_services: { [key: string]: string[] };
  manual_labor: { [key: string]: string[] };
  tech_services: { [key: string]: string[] };
  urgency_modifiers: string[];
  payment_signals: string[];
}

interface NegativeKeywords {
  employment_terms: string[];
  scam_indicators: string[];
  unpaid_work: string[];
  spam_patterns: string[];
  unrelated_content: string[];
}

interface ContextBoosters {
  location_keywords: string[];
  legitimacy_boosters: string[];
}

interface ImplementationPhase {
  phase: number;
  priority: string;
  sources_to_add: string[];
  keywords_to_add: string[];
  estimated_effort: string;
  expected_lead_increase?: string;
  expected_noise_reduction?: string;
  expected_lead_quality_improvement?: string;
}

export interface DiscoveryMapData {
  discovery_map_version: string;
  last_updated: string;
  market_area: string;
  data_sources: {
    tier_1_established: DataSource[];
    tier_2_niche: DataSource[];
    tier_3_emerging: DataSource[];
    local_forums_and_communities: LocalForumSource[];
    facebook_groups: FacebookGroupSource[];
    nextdoor_strategy: NextdoorStrategy;
    craigslist_optimization: CraigslistOptimization;
  };
  keyword_intelligence: {
    high_intent_keywords: HighIntentKeywords;
    negative_keywords: NegativeKeywords;
    context_boosters: ContextBoosters;
  };
  filtering_rules: {
    auto_reject_if: string[];
    auto_priority_boost_if: string[];
    flag_for_manual_review_if: string[];
  };
  implementation_roadmap: ImplementationPhase[];
  monitoring_recommendations: {
    optimal_check_frequency: { [key: string]: string };
    peak_posting_times: { [key: string]: string };
    seasonal_patterns: { [key: string]: string };
  };
  competitive_intelligence: {
    estimated_competitors_monitoring: string;
    average_response_time: string;
    your_target_response_time: string;
    competitive_advantage_tactics: string[];
  };
  expansion_opportunities: {
    platform: string;
    feasibility: string;
    notes: string;
  }[];
}
// --- END: New types for Discovery Map ---