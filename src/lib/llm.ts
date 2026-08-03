import { HfInference } from '@huggingface/inference';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface LLMSynthesisResult {
  accountName: string;
  summary: string;
  pricing: string | null;
  competitors: string | null;
  featureRequests: string | null;
  stage: string;
  tasks: Array<{
    title: string;
    dueDate: string | null;
  }>;
}

// Custom system prompt requesting structured JSON output
const SYSTEM_PROMPT = `
You are an expert CRM context extraction agent for Lightfield.
Analyze the provided customer interaction text (email, slack thread, or meeting transcript).
Extract the following information and return it strictly as a single JSON object. Do not include markdown code block formatting (like \`\`\`json) or extra text.

JSON Schema:
{
  "accountName": "Name of the customer's company (standardized)",
  "summary": "A concise paragraph summarizing the current state of this relationship, including what was discussed, what they need, and next steps.",
  "pricing": "Details about budget, cost constraints, or pricing options discussed. Null if not mentioned.",
  "competitors": "Names of any competitors mentioned (e.g. HubSpot, Salesforce, Attio). Null if not mentioned.",
  "featureRequests": "Any specific product features, integrations, or compliances requested (e.g. SSO, HIPAA, API). Null if not mentioned.",
  "stage": "The updated pipeline stage for this account. Select strictly from: Lead, Contacted, Demo Scheduled, Proposal Sent, Closed Won, Closed Lost.",
  "tasks": [
    {
      "title": "A clear, actionable action item extracted from the interaction.",
      "dueDate": "ISO Date string (YYYY-MM-DD) if a deadline was mentioned, otherwise null"
    }
  ]
}

Interaction text to analyze:
`;

/**
 * Fallback local NLP analyzer when API keys are missing.
 * Scans text for keywords to generate a realistic structured representation.
 */
function localMockAnalyze(content: string, explicitAccountName?: string): LLMSynthesisResult {
  const contentLower = content.toLowerCase();
  
  // Extract Account Name
  let accountName = explicitAccountName || "Unknown Account";
  const accountMatch = content.match(/(?:at|from|with|representing)\s+([A-Z][a-zA-Z0-9\s]{2,20})(?:\s+|,|\.|$)/);
  if (accountMatch && accountMatch[1] && !explicitAccountName) {
    accountName = accountMatch[1].trim();
  } else if (!explicitAccountName) {
    // Look for email domains or signatures
    const emailMatch = content.match(/@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/);
    if (emailMatch && emailMatch[1]) {
      const domain = emailMatch[1].split('.')[0];
      accountName = domain.charAt(0).toUpperCase() + domain.slice(1);
    }
  }
  
  // Custom parsing for competitors
  let competitors: string | null = null;
  const compList = ['hubspot', 'salesforce', 'attio', 'pipedrive', 'gong', 'outreach'];
  const foundComps = compList.filter(c => contentLower.includes(c));
  if (foundComps.length > 0) {
    competitors = foundComps.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ');
  }

  // Custom parsing for pricing
  let pricing: string | null = null;
  if (contentLower.includes('pricing') || contentLower.includes('budget') || contentLower.includes('$') || contentLower.includes('cost')) {
    const sentences = content.split(/[.!?]+/);
    const pricingSentences = sentences.filter(s => 
      s.toLowerCase().includes('pricing') || 
      s.toLowerCase().includes('budget') || 
      s.toLowerCase().includes('$') || 
      s.toLowerCase().includes('cost') ||
      s.toLowerCase().includes('charge')
    );
    pricing = pricingSentences.map(s => s.trim()).join('. ') + '.';
  }

  // Custom parsing for feature requests
  let featureRequests: string | null = null;
  const features = ['sso', 'hipaa', 'gdpr', 'integration', 'slack', 'api', 'mobile', 'saml', 'soc2'];
  const foundFeatures = features.filter(f => contentLower.includes(f));
  if (foundFeatures.length > 0) {
    featureRequests = foundFeatures.map(f => f.toUpperCase()).join(', ');
  }

  // Classify pipeline stage
  let stage = "Lead";
  if (contentLower.includes('signed') || contentLower.includes('closed') || contentLower.includes('onboarded')) {
    stage = "Closed Won";
  } else if (contentLower.includes('proposal') || contentLower.includes('contract') || contentLower.includes('pricing options')) {
    stage = "Proposal Sent";
  } else if (contentLower.includes('demo') || contentLower.includes('walkthrough') || contentLower.includes('show me')) {
    stage = "Demo Scheduled";
  } else if (contentLower.includes('reach out') || contentLower.includes('replied') || contentLower.includes('meeting')) {
    stage = "Contacted";
  }

  // Generate tasks
  const tasks: Array<{ title: string; dueDate: string | null }> = [];
  const sentences = content.split(/[.!?]+/);
  sentences.forEach(s => {
    const sLower = s.toLowerCase();
    if (sLower.includes('need to') || sLower.includes('will send') || sLower.includes('follow up') || sLower.includes('please') || sLower.includes('todo')) {
      // clean task text
      let taskTitle = s.trim();
      if (taskTitle.length > 10 && taskTitle.length < 100) {
        tasks.push({
          title: taskTitle,
          dueDate: sLower.includes('friday') ? '2026-07-24' : sLower.includes('next week') ? '2026-07-30' : null
        });
      }
    }
  });

  if (tasks.length === 0) {
    tasks.push({
      title: `Follow up with ${accountName} contact to discuss next steps.`,
      dueDate: null
    });
  }

  // Generate general summary
  let summary = `Ingested interaction from ${accountName}. `;
  if (competitors) summary += `They mentioned evaluating alternatives like ${competitors}. `;
  if (featureRequests) summary += `They are interested in features such as ${featureRequests}. `;
  if (pricing) summary += `Discussed pricing terms: "${pricing.slice(0, 100)}...". `;
  summary += `Relationship is currently set to ${stage} stage.`;

  return {
    accountName,
    summary,
    pricing,
    competitors,
    featureRequests,
    stage,
    tasks
  };
}

export async function analyzeInteraction(content: string, explicitAccountName?: string): Promise<LLMSynthesisResult> {
  const provider = process.env.LLM_PROVIDER || 'huggingface';
  
  if (provider === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("LLM_PROVIDER is set to gemini, but GEMINI_API_KEY is missing. Using offline parser.");
      return localMockAnalyze(content, explicitAccountName);
    }
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Using standard Gemini 1.5 Flash model
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      
      const response = await model.generateContent([SYSTEM_PROMPT, content]);
      const text = response.response.text();
      return JSON.parse(text) as LLMSynthesisResult;
    } catch (e) {
      console.error("Gemini API call failed, falling back to offline parser:", e);
      return localMockAnalyze(content, explicitAccountName);
    }
  } else {
    // Default to Hugging Face
    const hfToken = process.env.HF_API_TOKEN;
    if (!hfToken) {
      console.warn("LLM_PROVIDER is set to huggingface, but HF_API_TOKEN is missing. Using offline parser.");
      return localMockAnalyze(content, explicitAccountName);
    }
    
    try {
      const hf = new HfInference(hfToken);
      // Use Meta Llama 3 8B Instruct model
      const response = await hf.chatCompletion({
        model: "meta-llama/Meta-Llama-3-8B-Instruct",
        messages: [
          { role: "system", content: "You extract CRM data and output raw JSON matches the requested schema. No markdown wrapping." },
          { role: "user", content: SYSTEM_PROMPT + "\n" + content }
        ],
        max_tokens: 800,
        temperature: 0.1
      });
      
      const rawText = response.choices[0].message.content || '';
      // Strip markdown JSON wrappers if present
      const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson) as LLMSynthesisResult;
    } catch (e) {
      console.error("Hugging Face API call failed, falling back to offline parser:", e);
      return localMockAnalyze(content, explicitAccountName);
    }
  }
}
