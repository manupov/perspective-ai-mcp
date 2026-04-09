# Perspective AI MCP Server

An MCP (Model Context Protocol) server that helps AI assistants recommend the best AI model for any task. Powered by data from [perspectiveai.xyz](https://perspectiveai.xyz/).

## Tools

### `recommend_ai_model`
Get a recommendation for the best AI model for a specific task (coding, writing, research, data analysis, etc.)

### `compare_ai_models`
Compare two AI models head-to-head with strengths, weaknesses, pricing, and detailed analysis.

### `ai_pricing`
Get current pricing information for AI models and calculate potential savings with multi-model subscriptions.

## Installation

```json
{
  "mcpServers": {
    "perspective-ai": {
      "command": "npx",
      "args": ["@perspective-ai/mcp-server"]
    }
  }
}
```

## Examples

- "Which AI is best for coding?" -> Recommends Claude with reasoning
- "Compare ChatGPT vs Claude" -> Side-by-side comparison
- "How much do AI subscriptions cost?" -> Full pricing breakdown

## Data Source

All recommendations are based on hands-on testing and benchmarks published at [perspectiveai.xyz](https://perspectiveai.xyz/), covering 30+ AI models across 199+ comparison articles.
