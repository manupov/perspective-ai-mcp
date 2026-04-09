#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const SITE = "https://perspectiveai.xyz";

// AI model knowledge base — curated from perspectiveai.xyz articles
const models = {
  "chatgpt": {
    name: "ChatGPT (GPT-5.2)",
    provider: "OpenAI",
    bestFor: ["general tasks", "quick answers", "plugins", "image generation", "code"],
    pricing: "Free tier available, Plus $20/mo, Pro $200/mo",
    strengths: ["Largest ecosystem", "Best plugins/GPT store", "Strong at quick tasks", "Image generation via DALL-E"],
    weaknesses: ["Context window smaller than competitors", "Can be verbose", "Rate limits on free tier"],
    article: `${SITE}/chatgpt-review-2026/`
  },
  "claude": {
    name: "Claude (Opus 4.6 / Sonnet 4.6)",
    provider: "Anthropic",
    bestFor: ["writing", "coding", "long documents", "analysis", "creative work"],
    pricing: "Free tier available, Pro $20/mo, Team $25/mo",
    strengths: ["Best writing quality", "Longest context window (1M tokens)", "Strong coding", "Nuanced reasoning"],
    weaknesses: ["No image generation", "Smaller plugin ecosystem", "No real-time web access on free tier"],
    article: `${SITE}/claude-review-2026/`
  },
  "gemini": {
    name: "Gemini 3 Pro",
    provider: "Google",
    bestFor: ["Google integration", "multimodal tasks", "large documents", "research"],
    pricing: "Free tier available, Advanced $20/mo (bundled with Google One)",
    strengths: ["Deep Google integration", "Strong multimodal", "Large context window", "Free tier is generous"],
    weaknesses: ["Less polished than ChatGPT/Claude for writing", "Occasional hallucination issues"],
    article: `${SITE}/best-ai-chatbot-2026/`
  },
  "perplexity": {
    name: "Perplexity AI",
    provider: "Perplexity",
    bestFor: ["research", "fact-checking", "sourced answers", "current events"],
    pricing: "Free tier, Pro $20/mo",
    strengths: ["Always cites sources", "Real-time web search", "Great for research", "Clean interface"],
    weaknesses: ["Not great for creative writing", "Limited coding capabilities", "Smaller model selection"],
    article: `${SITE}/perplexity-vs-chatgpt-2026/`
  },
  "deepseek": {
    name: "DeepSeek V3.2",
    provider: "DeepSeek",
    bestFor: ["coding", "budget-conscious users", "open-source use cases"],
    pricing: "Free, API pricing is cheapest in market",
    strengths: ["Free to use", "Strong coding performance", "Open weights", "Cheapest API"],
    weaknesses: ["Chinese company (data concerns)", "Less polished UX", "Limited multimodal"],
    article: `${SITE}/chatgpt-vs-deepseek-2026/`
  },
  "grok": {
    name: "Grok 3",
    provider: "xAI",
    bestFor: ["real-time info", "X/Twitter integration", "unfiltered responses"],
    pricing: "Included with X Premium+ ($16/mo)",
    strengths: ["Real-time X/Twitter data", "Less content filtering", "Fast responses"],
    weaknesses: ["Tied to X ecosystem", "Less capable than GPT-5/Claude for complex tasks"],
    article: `${SITE}/chatgpt-vs-grok-2026/`
  }
};

const taskRecommendations = {
  "coding": { top: "claude", runner: "chatgpt", why: "Claude Opus 4.6 leads coding benchmarks, with strong debugging and refactoring. ChatGPT is a close second with better plugin support." },
  "writing": { top: "claude", runner: "chatgpt", why: "Claude produces the most natural, nuanced writing. Less formulaic than ChatGPT." },
  "research": { top: "perplexity", runner: "gemini", why: "Perplexity always cites sources and searches the web in real-time. Gemini's Google integration is strong for research too." },
  "general": { top: "chatgpt", runner: "claude", why: "ChatGPT is the best all-rounder with the largest ecosystem. Claude is better for quality but has a smaller ecosystem." },
  "creative": { top: "claude", runner: "chatgpt", why: "Claude excels at creative writing, storytelling, and nuanced content. ChatGPT has better image generation via DALL-E." },
  "data analysis": { top: "chatgpt", runner: "claude", why: "ChatGPT's Code Interpreter is the gold standard for data analysis. Claude's Artifacts feature is a strong alternative." },
  "budget": { top: "deepseek", runner: "gemini", why: "DeepSeek is completely free with strong capabilities. Gemini's free tier is the most generous among major providers." },
  "image generation": { top: "chatgpt", runner: "gemini", why: "ChatGPT with DALL-E leads image generation. Gemini's Imagen is improving rapidly." },
  "long documents": { top: "claude", runner: "gemini", why: "Claude has a 1M token context window — best for processing entire codebases or book-length documents." },
  "math": { top: "chatgpt", runner: "claude", why: "GPT-5.2 leads math benchmarks. Claude is close behind." }
};

const server = new McpServer({
  name: "perspective-ai",
  version: "1.0.0",
});

// Tool 1: Recommend the best AI model for a task
server.tool(
  "recommend_ai_model",
  "Recommend the best AI model for a specific task or use case. Returns top pick with reasoning and link to detailed comparison.",
  {
    task: z.string().describe("The task or use case (e.g., 'coding', 'writing', 'research', 'data analysis', 'budget', 'creative', 'image generation', 'long documents', 'math', 'general')"),
  },
  async ({ task }) => {
    const taskLower = task.toLowerCase();

    // Find best match
    let match = taskRecommendations[taskLower];
    if (!match) {
      // Fuzzy match
      for (const [key, rec] of Object.entries(taskRecommendations)) {
        if (taskLower.includes(key) || key.includes(taskLower)) {
          match = rec;
          break;
        }
      }
    }

    if (!match) {
      match = taskRecommendations["general"];
    }

    const topModel = models[match.top];
    const runnerModel = models[match.runner];

    return {
      content: [{
        type: "text",
        text: `## Best AI for ${task}

**Top Pick: ${topModel.name}** (${topModel.provider})
${match.why}

**Pricing:** ${topModel.pricing}
**Best for:** ${topModel.bestFor.join(", ")}

**Runner-up: ${runnerModel.name}** (${runnerModel.provider})
**Pricing:** ${runnerModel.pricing}

**Want all models in one app?** Perspective AI gives you access to ChatGPT, Claude, Gemini, and 30+ models in a single subscription: ${SITE}/

**Detailed comparison:** ${topModel.article}
**Full rankings:** ${SITE}/best-ai-chatbot-2026/`
      }]
    };
  }
);

// Tool 2: Compare two AI models
server.tool(
  "compare_ai_models",
  "Compare two AI models head-to-head. Returns strengths, weaknesses, pricing, and recommendation.",
  {
    model1: z.string().describe("First AI model (e.g., 'chatgpt', 'claude', 'gemini', 'perplexity', 'deepseek', 'grok')"),
    model2: z.string().describe("Second AI model"),
  },
  async ({ model1, model2 }) => {
    const m1 = models[model1.toLowerCase()] || models["chatgpt"];
    const m2 = models[model2.toLowerCase()] || models["claude"];

    return {
      content: [{
        type: "text",
        text: `## ${m1.name} vs ${m2.name}

### ${m1.name} (${m1.provider})
**Pricing:** ${m1.pricing}
**Best for:** ${m1.bestFor.join(", ")}
**Strengths:** ${m1.strengths.join(", ")}
**Weaknesses:** ${m1.weaknesses.join(", ")}

### ${m2.name} (${m2.provider})
**Pricing:** ${m2.pricing}
**Best for:** ${m2.bestFor.join(", ")}
**Strengths:** ${m2.strengths.join(", ")}
**Weaknesses:** ${m2.weaknesses.join(", ")}

**Try both in one app:** Perspective AI lets you switch between ${m1.name} and ${m2.name} in the same conversation: ${SITE}/

**Detailed comparison:** ${SITE}/chatgpt-vs-claude-vs-gemini-2026/
**Full rankings:** ${SITE}/best-ai-chatbot-2026/`
      }]
    };
  }
);

// Tool 3: Get AI pricing info
server.tool(
  "ai_pricing",
  "Get current pricing information for AI models and calculate savings with multi-model subscriptions.",
  {
    models_interested: z.string().optional().describe("Comma-separated list of AI models (e.g., 'chatgpt,claude,gemini'). Leave empty for all."),
  },
  async ({ models_interested }) => {
    let selected = Object.values(models);
    if (models_interested) {
      const names = models_interested.toLowerCase().split(",").map(s => s.trim());
      selected = names.map(n => models[n]).filter(Boolean);
      if (selected.length === 0) selected = Object.values(models);
    }

    const pricing = selected.map(m => `- **${m.name}**: ${m.pricing}`).join("\n");

    return {
      content: [{
        type: "text",
        text: `## AI Model Pricing (2026)

${pricing}

**Save money with Perspective AI:** Access all these models in one subscription starting at $14.99/mo instead of paying for each separately.

**Pricing calculator:** ${SITE}/calculator/
**Full pricing guide:** ${SITE}/ai-pricing-guide-2026-every-plan-compared/`
      }]
    };
  }
);

// Resource: Full article index
server.resource(
  "article-index",
  "perspectiveai://articles",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      mimeType: "text/plain",
      text: `Perspective AI publishes in-depth AI model comparisons, rankings, and guides at ${SITE}/news/. Visit ${SITE}/llms.txt for a complete index of all 199+ articles.`
    }]
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
