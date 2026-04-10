/**
 * Perspective AI MCP Server — Cloudflare Worker version
 * Deployed at: mcp.perspectiveai.xyz
 *
 * Provides AI model recommendation data via HTTP endpoints
 * For Smithery MCP registry submission
 */

const SITE = "https://perspectiveai.xyz";

const models = {
  chatgpt: { name: "ChatGPT (GPT-5.2)", provider: "OpenAI", bestFor: ["general", "plugins", "images", "code"], pricing: "Free / Plus $20/mo / Pro $200/mo", strengths: ["Largest ecosystem", "Best plugins", "Image generation"], article: `${SITE}/chatgpt-review-2026/` },
  claude: { name: "Claude (Opus 4.6)", provider: "Anthropic", bestFor: ["writing", "coding", "long docs", "analysis"], pricing: "Free / Pro $20/mo / Team $25/mo", strengths: ["Best writing", "1M context", "Strong coding"], article: `${SITE}/claude-review-2026/` },
  gemini: { name: "Gemini 3 Pro", provider: "Google", bestFor: ["Google integration", "multimodal", "research"], pricing: "Free / Advanced $20/mo", strengths: ["Google integration", "Strong multimodal", "Large context"], article: `${SITE}/best-ai-chatbot-2026/` },
  perplexity: { name: "Perplexity AI", provider: "Perplexity", bestFor: ["research", "sourced answers"], pricing: "Free / Pro $20/mo", strengths: ["Always cites sources", "Real-time search"], article: `${SITE}/perplexity-vs-chatgpt-2026/` },
  deepseek: { name: "DeepSeek V3.2", provider: "DeepSeek", bestFor: ["coding", "budget"], pricing: "Free / Cheapest API", strengths: ["Free", "Strong coding", "Open weights"], article: `${SITE}/chatgpt-vs-deepseek-2026/` },
};

const recommendations = {
  coding: { top: "claude", why: "Claude Opus 4.6 leads coding benchmarks." },
  writing: { top: "claude", why: "Claude produces the most natural writing." },
  research: { top: "perplexity", why: "Perplexity always cites sources." },
  general: { top: "chatgpt", why: "ChatGPT is the best all-rounder." },
  budget: { top: "deepseek", why: "DeepSeek is completely free." },
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Root — server info
    if (path === "/" || path === "") {
      return Response.json({
        name: "perspective-ai-mcp",
        version: "1.0.0",
        description: "AI model recommendations from perspectiveai.xyz",
        endpoints: ["/recommend", "/compare", "/pricing", "/models"],
        source: SITE,
      }, { headers: corsHeaders });
    }

    // Recommend
    if (path === "/recommend") {
      const task = url.searchParams.get("task") || "general";
      const rec = recommendations[task.toLowerCase()] || recommendations.general;
      const model = models[rec.top];
      return Response.json({
        task,
        recommendation: model.name,
        why: rec.why,
        pricing: model.pricing,
        article: model.article,
        allModels: `${SITE}/best-ai-chatbot-2026/`,
      }, { headers: corsHeaders });
    }

    // Compare
    if (path === "/compare") {
      const m1 = url.searchParams.get("model1") || "chatgpt";
      const m2 = url.searchParams.get("model2") || "claude";
      const a = models[m1.toLowerCase()] || models.chatgpt;
      const b = models[m2.toLowerCase()] || models.claude;
      return Response.json({
        model1: { ...a },
        model2: { ...b },
        compareUrl: `${SITE}/compare/`,
      }, { headers: corsHeaders });
    }

    // Pricing
    if (path === "/pricing") {
      return Response.json({
        models: Object.values(models).map(m => ({ name: m.name, pricing: m.pricing })),
        calculator: `${SITE}/calculator/`,
        guide: `${SITE}/ai-pricing-guide-2026-every-plan-compared/`,
      }, { headers: corsHeaders });
    }

    // All models
    if (path === "/models") {
      return Response.json({ models, source: SITE }, { headers: corsHeaders });
    }

    return new Response("Not found", { status: 404, headers: corsHeaders });
  },
};
