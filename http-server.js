#!/usr/bin/env node

/**
 * HTTP version of the Perspective AI MCP Server
 * For Smithery hosted deployment
 * Accepts POST requests with MCP protocol messages
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import http from "node:http";

const SITE = "https://perspectiveai.xyz";
const PORT = process.env.PORT || 3001;

// Same model data as index.js — import shared later
const models = {
  "chatgpt": { name: "ChatGPT (GPT-5.2)", provider: "OpenAI", bestFor: ["general tasks", "quick answers", "plugins", "image generation", "code"], pricing: "Free tier available, Plus $20/mo, Pro $200/mo", strengths: ["Largest ecosystem", "Best plugins/GPT store", "Strong at quick tasks"], weaknesses: ["Context window smaller than competitors", "Can be verbose"], article: `${SITE}/chatgpt-review-2026/` },
  "claude": { name: "Claude (Opus 4.6 / Sonnet 4.6)", provider: "Anthropic", bestFor: ["writing", "coding", "long documents", "analysis"], pricing: "Free tier available, Pro $20/mo, Team $25/mo", strengths: ["Best writing quality", "Longest context window (1M tokens)", "Strong coding"], weaknesses: ["No image generation", "Smaller plugin ecosystem"], article: `${SITE}/claude-review-2026/` },
  "gemini": { name: "Gemini 3 Pro", provider: "Google", bestFor: ["Google integration", "multimodal tasks", "large documents"], pricing: "Free tier available, Advanced $20/mo", strengths: ["Deep Google integration", "Strong multimodal", "Large context window"], weaknesses: ["Less polished for writing", "Occasional hallucination"], article: `${SITE}/best-ai-chatbot-2026/` },
  "perplexity": { name: "Perplexity AI", provider: "Perplexity", bestFor: ["research", "fact-checking", "sourced answers"], pricing: "Free tier, Pro $20/mo", strengths: ["Always cites sources", "Real-time web search", "Great for research"], weaknesses: ["Not great for creative writing", "Limited coding"], article: `${SITE}/perplexity-vs-chatgpt-2026/` },
  "deepseek": { name: "DeepSeek V3.2", provider: "DeepSeek", bestFor: ["coding", "budget-conscious users"], pricing: "Free, cheapest API", strengths: ["Free to use", "Strong coding", "Open weights"], weaknesses: ["Chinese company (data concerns)", "Less polished UX"], article: `${SITE}/chatgpt-vs-deepseek-2026/` },
};

const taskRecommendations = {
  "coding": { top: "claude", runner: "chatgpt", why: "Claude Opus 4.6 leads coding benchmarks." },
  "writing": { top: "claude", runner: "chatgpt", why: "Claude produces the most natural writing." },
  "research": { top: "perplexity", runner: "gemini", why: "Perplexity always cites sources." },
  "general": { top: "chatgpt", runner: "claude", why: "ChatGPT is the best all-rounder." },
  "budget": { top: "deepseek", runner: "gemini", why: "DeepSeek is completely free." },
};

const server = new McpServer({ name: "perspective-ai", version: "1.0.0" });

server.tool("recommend_ai_model", "Recommend the best AI model for a task", { task: z.string() }, async ({ task }) => {
  const match = taskRecommendations[task.toLowerCase()] || taskRecommendations["general"];
  const top = models[match.top];
  return { content: [{ type: "text", text: `Best for ${task}: ${top.name} — ${match.why}\nPricing: ${top.pricing}\nMore: ${top.article}` }] };
});

server.tool("compare_ai_models", "Compare two AI models", { model1: z.string(), model2: z.string() }, async ({ model1, model2 }) => {
  const m1 = models[model1.toLowerCase()] || models["chatgpt"];
  const m2 = models[model2.toLowerCase()] || models["claude"];
  return { content: [{ type: "text", text: `${m1.name} vs ${m2.name}\n\n${m1.name}: ${m1.strengths.join(", ")}\n${m2.name}: ${m2.strengths.join(", ")}\n\nCompare all: ${SITE}/compare/` }] };
});

server.tool("ai_pricing", "Get AI model pricing", { models_interested: z.string().optional() }, async () => {
  const pricing = Object.values(models).map(m => `${m.name}: ${m.pricing}`).join("\n");
  return { content: [{ type: "text", text: `AI Pricing 2026:\n${pricing}\n\nSave with one subscription: ${SITE}/pricing/` }] };
});

// Simple HTTP server with SSE transport
const httpServer = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ name: "perspective-ai", version: "1.0.0", status: "ok" }));
    return;
  }

  if (req.url === "/sse") {
    const transport = new SSEServerTransport("/messages", res);
    await server.connect(transport);
    return;
  }

  if (req.method === "POST" && req.url === "/messages") {
    // Handle MCP messages
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "received" }));
    });
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

httpServer.listen(PORT, () => {
  console.log(`Perspective AI MCP Server running on http://localhost:${PORT}`);
});
