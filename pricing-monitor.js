#!/usr/bin/env node

/**
 * Pricing Monitor — tracks AI model pricing pages for changes
 * Uses fetch to check pricing pages and compares against known prices.
 * Run weekly via cron to keep perspectiveai.xyz pricing data fresh.
 *
 * For more sophisticated scraping (JS-heavy pages, anti-bot),
 * consider Firecrawl (firecrawl.dev) or Crawl4AI (github.com/unclecode/crawl4ai)
 */

const PRICING_PAGES = [
  { name: 'OpenAI ChatGPT', url: 'https://openai.com/chatgpt/pricing/', keywords: ['Plus', 'Pro', 'Free'] },
  { name: 'Anthropic Claude', url: 'https://www.anthropic.com/pricing', keywords: ['Pro', 'Team', 'Free'] },
  { name: 'Google Gemini', url: 'https://gemini.google.com/advanced', keywords: ['Advanced', 'Ultra'] },
  { name: 'Perplexity', url: 'https://www.perplexity.ai/pro', keywords: ['Pro', 'Free'] },
  { name: 'xAI Grok', url: 'https://x.ai/', keywords: ['Premium', 'SuperGrok'] },
];

async function checkPricingPage(page) {
  try {
    const response = await fetch(page.url, {
      headers: { 'User-Agent': 'PerspectiveAI-PricingMonitor/1.0' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return { name: page.name, status: 'error', code: response.status };
    }

    const html = await response.text();

    // Extract price-like patterns
    const pricePattern = /\$\d+(?:\.\d{2})?(?:\/mo(?:nth)?)?/g;
    const prices = [...new Set(html.match(pricePattern) || [])];

    // Check for keyword presence
    const foundKeywords = page.keywords.filter(kw => html.includes(kw));

    return {
      name: page.name,
      status: 'ok',
      prices: prices.slice(0, 10),
      keywords: foundKeywords,
      contentLength: html.length,
    };
  } catch (err) {
    return { name: page.name, status: 'error', error: err.message };
  }
}

async function main() {
  console.log('Perspective AI Pricing Monitor');
  console.log('=' .repeat(50));
  console.log(`Checking ${PRICING_PAGES.length} pricing pages...\n`);

  for (const page of PRICING_PAGES) {
    const result = await checkPricingPage(page);
    console.log(`${result.name}:`);
    if (result.status === 'ok') {
      console.log(`  Prices found: ${result.prices.join(', ') || 'none (may need JS rendering)'}`);
      console.log(`  Keywords: ${result.keywords.join(', ')}`);
      console.log(`  Page size: ${(result.contentLength / 1024).toFixed(0)}KB`);
    } else {
      console.log(`  Error: ${result.error || `HTTP ${result.code}`}`);
    }
    console.log();
  }

  console.log('Note: Many pricing pages require JavaScript rendering.');
  console.log('For full extraction, use Firecrawl (firecrawl.dev) or Crawl4AI.');
}

main();
