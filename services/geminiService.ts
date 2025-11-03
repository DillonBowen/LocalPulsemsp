import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ChatMessage, Opportunity, EnrichedOpportunity, DraftedResponse, DiscoveryMapData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Model for Complex Tasks & Lead Enrichment ---
export const enrichOpportunity = async (opportunityTitle: string, opportunitySnippet: string): Promise<EnrichedOpportunity> => {
    try {
        const prompt = `
        You are an expert NLP and Data Analyst specializing in gig-economy opportunity extraction. Your function is to act as a "Lead Triage & Qualification Engine".
        Analyze the provided raw text from an online posting and extract key information using multi-step reasoning.
        Return ONLY a valid JSON object based on the provided schema. Use null for any field that cannot be determined.
        The current timestamp is ${new Date().toISOString()}.
        For location, focus on the Minneapolis-St. Paul, MN metro area.

        INPUT TEXT:
        Title: "${opportunityTitle}"
        Body: "${opportunitySnippet}"

        YOUR RESPONSE MUST BE A VALID JSON OBJECT WITH THE FOLLOWING STRUCTURE:
        {
          "enrichment_version": "2.0",
          "processed_at": "ISO 8601 timestamp",
          "gig_category": "string | null",
          "gig_subcategory": "string | null",
          "urgency_level": "immediate" | "within_24h" | "within_week" | "flexible" | "ongoing" | null,
          "urgency_deadline": "string (natural language) | null",
          "budget": { "mentioned": boolean, "min_amount": number | null, "max_amount": number | null, "currency": "USD" | "other" | null, "payment_type": "cash" | "check" | "venmo" | "paypal" | "platform" | "negotiable" | null, "estimated": boolean, "estimation_confidence": "high" | "medium" | "low" | null },
          "location": { "city": "string | null", "neighborhood": "string | null", "zip_code": "string | null", "state": "string | null", "address_provided": boolean, "specificity_score": number (0-100), "normalized_location": "string (standardized format) | null" },
          "legitimacy_assessment": { "score": number (0-100), "red_flags": ["array of specific concerns"] | [], "green_flags": ["array of positive indicators"] | [], "confidence_level": "high" | "medium" | "low", "reasoning": "brief explanation (1-2 sentences)", "scam_probability": "very_low" | "low" | "medium" | "high" | "very_high" },
          "contact_info": { "method": "email" | "phone" | "platform_message" | "not_specified" | null, "extracted_email": "string | null", "extracted_phone": "string | null", "preferred_contact": "string | null", "contact_visibility": "public" | "private" | "unclear" },
          "required_skills": ["array of skills/tools needed"],
          "skill_level_required": "beginner" | "intermediate" | "expert" | "any" | null,
          "job_description_summary": "string (2-3 sentence summary)",
          "key_requirements": ["array of specific requirements mentioned"],
          "deal_breakers": ["array of requirements that might disqualify this lead"] | [],
          "sentiment": "desperate" | "casual" | "professional" | "frustrated" | "neutral" | null,
          "poster_type": "homeowner" | "business" | "property_manager" | "individual" | "unclear" | null,
          "response_priority": "high" | "medium" | "low",
          "priority_reasoning": "brief explanation of priority score",
          "estimated_duration": "string (e.g., '2-4 hours', '1 day', 'ongoing') | null",
          "estimated_effort": "quick_task" | "half_day" | "full_day" | "multi_day" | "ongoing" | null,
          "competition_level": "high" | "medium" | "low",
          "competition_reasoning": "brief explanation",
          "response_window": "string (e.g., 'respond within 1 hour', 'flexible') | null",
          "pre_drafted_response": { "formal": "string (professional 3-4 sentence response)", "casual": "string (friendly 3-4 sentence response)", "recommended_tone": "formal" | "casual" },
          "suggested_next_actions": ["array of recommended immediate steps"],
          "questions_to_ask": ["array of clarifying questions for follow-up"] | [],
          "value_score": number (0-100),
          "value_reasoning": "brief explanation of value calculation",
          "tags": ["array of searchable tags for filtering/categorization"],
          "similar_gigs_indicator": "string (keywords for finding similar past opportunities) | null"
        }
        `;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        // The response text should be a valid JSON string.
        return JSON.parse(response.text);

    } catch (error) {
        console.error("Error in enrichOpportunity:", error);
        throw new Error("An error occurred while analyzing the gig. Please try again.");
    }
};

// --- Low-Latency Model for Quick Responses ---
export const draftResponse = async (opportunity: Opportunity, userSkills: string): Promise<DraftedResponse> => {
    try {
        const prompt = `
        You are an expert at writing compelling, concise, and professional responses to freelance gig postings.
        A freelancer with the following skills: "${userSkills}" wants to respond to the gig below.

        **Gig Title:** ${opportunity.title}
        **Gig Description:** ${opportunity.snippet}

        Analyze the tone of the gig posting and generate two response options: one formal and one casual. Also recommend which tone is more appropriate.
        The response should:
        1. Acknowledge their specific need.
        2. Briefly mention relevant experience/skills.
        3. Ask one clarifying question if needed.
        4. Provide a clear call-to-action.
        5. Be 3-4 sentences maximum.

        Return ONLY a valid JSON object with this exact structure:
        {
          "formal": "string (professional 3-4 sentence response)",
          "casual": "string (friendly 3-4 sentence response)",
          "recommended_tone": "formal" | "casual"
        }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest', // Using a fast model for quick drafting
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        return JSON.parse(response.text);

    } catch (error) {
        console.error("Error in draftResponse:", error);
        // Return a default error object that matches the expected type
        return {
            formal: "Sorry, an error occurred while drafting the response.",
            casual: "Sorry, an error occurred while drafting the response.",
            recommended_tone: 'formal'
        };
    }
};


// --- Model for Image Generation ---
export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });
        
        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        return "";
    } catch (error) {
        console.error("Error in generateImage:", error);
        return "";
    }
};

// --- Model for Image Understanding ---
export const analyzeImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                mimeType,
                data: imageBase64,
            },
        };
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });
        return response.text;
    } catch (error) {
        // FIX: Added curly braces to the catch block to fix a syntax error.
        console.error("Error analyzing image:", error);
        return "Sorry, I couldn't analyze that image. Please try again.";
    }
};

// --- Model for Chat ---
let chat: Chat | null = null;

export const startChat = () => {
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: "You are LocalPulse AI, a helpful assistant for freelancers in the Minneapolis-St. Paul area. You provide advice, answer questions about the app, and help users find opportunities.",
        },
    });
};

export const sendMessageToBot = async (message: string): Promise<string> => {
    if (!chat) {
        startChat();
    }
    try {
        const response = await chat!.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Error sending message to bot:", error);
        return "I'm having trouble connecting right now. Please try again in a moment.";
    }
};

// --- Model with Maps Grounding ---
export const findOnMap = async (prompt: string, location: GeolocationCoordinates): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: location.latitude,
                            longitude: location.longitude
                        }
                    }
                }
            },
        });
        
        let resultText = response.text;
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        if (groundingChunks && groundingChunks.length > 0) {
            const places = groundingChunks
              .filter((chunk: any) => chunk.maps && chunk.maps.uri)
              .map((chunk: any) => `[${chunk.maps.title}](${chunk.maps.uri})`);
            
            if (places.length > 0) {
                resultText += "\n\n**Relevant Places on Google Maps:**\n" + places.join('\n');
            }
        }

        return resultText;

    } catch (error) {
        console.error("Error using Maps Grounding:", error);
        return "An error occurred while searching with Maps. Please ensure location permissions are enabled.";
    }
};

// --- Model for Discovery Map Generation ---
export const generateDiscoveryMap = async (): Promise<DiscoveryMapData> => {
    try {
        const prompt = `
        You are a "Digital Sleuth" and hyper-local market intelligence specialist for the Minneapolis-St. Paul metro area.
        Your task is to generate a comprehensive "Local Discovery Map" and "Intelligence Enhancement Package" as a structured JSON object.
        The current timestamp is ${new Date().toISOString()}.
        RETURN ONLY VALID JSON - NO EXPLANATORY TEXT OUTSIDE THE JSON STRUCTURE.

        The JSON output must follow this exact structure:
        {
          "discovery_map_version": "2.0", "last_updated": "ISO 8601 timestamp", "market_area": "Minneapolis-St. Paul Metro",
          "data_sources": {
            "tier_1_established": [{ "platform": "string", "source_name": "string", "url": "string", "category_relevance": ["all"], "estimated_volume": "string", "api_available": boolean, "update_frequency": "string", "legitimacy_score": number, "integration_priority": "string", "notes": "string" }],
            "tier_2_niche": [{ "platform": "string", "source_name": "string", "url": "string", "category_relevance": ["string"], "estimated_volume": "string", "api_available": boolean, "update_frequency": "string", "legitimacy_score": number, "integration_priority": "string", "notes": "string", "seasonal_patterns": "string" }],
            "tier_3_emerging": [{ "platform": "string", "source_name": "string", "url": "string", "category_relevance": ["string"], "estimated_volume": "string", "api_available": boolean, "update_frequency": "string", "legitimacy_score": number, "integration_priority": "string", "notes": "string", "implementation_difficulty": "string" }],
            "local_forums_and_communities": [{ "type": "string", "examples": ["string"], "category_relevance": ["string"], "discovery_method": "string", "estimated_sources": "string", "integration_priority": "string", "notes": "string" }],
            "facebook_groups": [{ "search_query": "string", "group_type": "string", "category_relevance": ["string"], "estimated_count": "string", "access_method": "string", "posting_frequency": "string", "integration_priority": "string", "privacy_note": "string" }],
            "nextdoor_strategy": { "available": boolean, "coverage": "string", "api_available": boolean, "scraping_feasibility": "string", "alternative_approach": "string", "search_query": "string", "integration_priority": "string", "notes": "string" },
            "craigslist_optimization": { "current_sections": ["string"], "recommended_additional": ["string"], "posting_patterns": "string", "update_frequency": "string", "geographical_coverage": ["string"], "integration_priority": "string" }
          },
          "keyword_intelligence": {
            "high_intent_keywords": {
              "creative_services": { "photo_video": ["string"], "graphic_design": ["string"] },
              "manual_labor": { "moving": ["string"], "landscaping": ["string"], "handyman": ["string"] },
              "tech_services": { "web_design": ["string"], "it_support": ["string"] },
              "urgency_modifiers": ["string"], "payment_signals": ["string"]
            },
            "negative_keywords": { "employment_terms": ["string"], "scam_indicators": ["string"], "unpaid_work": ["string"], "spam_patterns": ["string"], "unrelated_content": ["string"] },
            "context_boosters": { "location_keywords": ["string"], "legitimacy_boosters": ["string"] }
          },
          "filtering_rules": { "auto_reject_if": ["string"], "auto_priority_boost_if": ["string"], "flag_for_manual_review_if": ["string"] },
          "implementation_roadmap": [{ "phase": number, "priority": "string", "sources_to_add": ["string"], "keywords_to_add": ["string"], "estimated_effort": "string", "expected_lead_increase": "string" }],
          "monitoring_recommendations": {
            "optimal_check_frequency": { "craigslist": "string", "reddit_tier_1": "string" },
            "peak_posting_times": { "weekday": "string", "weekend": "string" },
            "seasonal_patterns": { "moving_gigs": "string", "landscaping": "string" }
          },
          "competitive_intelligence": { "estimated_competitors_monitoring": "string", "average_response_time": "string", "your_target_response_time": "string", "competitive_advantage_tactics": ["string"] },
          "expansion_opportunities": [{ "platform": "string", "feasibility": "string", "notes": "string" }]
        }`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        return JSON.parse(response.text);

    } catch (error) {
        console.error("Error generating Discovery Map:", error);
        throw new Error("An error occurred while generating the Discovery Map. Please try again.");
    }
};


// --- Model for Design System Generation ---
export const generateDesignSystem = async (): Promise<string> => {
    try {
        const prompt = `
        Act as an expert UI/UX designer and product strategist with 15+ years of experience specializing in mobile and web applications.
        Your goal is to provide a comprehensive design system and strategy for a new application called "LocalPulse MSP".

        ### App Context
        - **App Name:** LocalPulse MSP
        - **Purpose:** An intelligent opportunity-discovery platform that connects local freelancers in the Minneapolis-St. Paul area with residents needing help.
        - **Target Audience:** Local freelancers (handymen, designers, photographers, etc.) and residents/small businesses seeking services.

        ### Current UI/UX Challenges
        The current interface suffers from several key issues that need to be addressed:
        - **Unintuitive Navigation:** Users struggle to find key sections like job listings, proposal management, and profile settings. The user flow is not logical.
        - **Inconsistent Visual Hierarchy:** Important elements (like a new job match) do not stand out from less important information. All content competes for the user's attention.
        - **Lack of Responsiveness:** The components are static and do not adapt to different screen sizes, providing a poor experience on mobile devices, which are essential for our target audience.
        - **Outdated Aesthetic:** The app lacks a modern, clean, and trustworthy visual design.
        - **Information Overload:** The interface presents too much data at once, overwhelming the user. It fails to use progressive disclosure to show information as needed.

        ### Design Goals & Constraints
        - **Primary Goal:** Create a clean, modern, and intuitive user interface that makes finding and applying for local gigs fast and effortless.
        - **Aesthetic:** The design should be minimalist, professional, and highly legible. It should inspire trust and confidence.
        - **Inspiration:** Draw inspiration from the principles of Google's Material 3 design system for consistency and a modern feel, but create a unique brand identity for LocalPulse MSP.
        - **Tone:** The UI copy should be encouraging, clear, and action-oriented.
        - **Constraint:** The solution must prioritize a "mobile-first" approach, ensuring the design works flawlessly on small screens before being adapted for desktops.

        ### Requested Solution
        Provide a comprehensive UI/UX design system for the "LocalPulse MSP" application. The system should be broken down into the following parts:

        1.  **Core Design Principles:** A list of 3-5 guiding principles for the app's design (e.g., "Clarity First," "Effortless Action").
        2.  **Color Palette:** A primary, secondary, and accent color, along with neutral shades for backgrounds and text. Provide hex codes.
        3.  **Typography Scale:** Define the font, sizes, and weights for headings, subheadings, body text, and captions.
        4.  **Component Design:** For each of the challenges listed above, design a key component that solves the problem. Provide a conceptual description and a visual layout (described in text or as a simple wireframe).
            -   **For Navigation:** Design the main app navigation (e.g., a tab bar or a sidebar).
            -   **For Visual Hierarchy:** Design a "Job Card" component for displaying a single gig in a list.
            -   **For Responsiveness:** Describe how the "Job Card" and the main layout should adapt from a mobile view to a desktop view.
            -   **For Progressive Disclosure:** Design the interaction for a job listing. Show what the user sees initially on the "Job Card" and what they see after clicking for more details.

        ### Output Formatting
        - Structure the entire response using clear Markdown headings and subheadings.
        - Use bullet points to list principles, colors, and typographic styles.
        - For component designs, use nested bullet points or simple text diagrams to describe the layout and elements.
        `;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
        });

        return response.text;

    } catch (error) {
        console.error("Error generating Design System:", error);
        return "An error occurred while generating the Design System. Please try again.";
    }
};