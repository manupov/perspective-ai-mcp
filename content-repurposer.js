#!/usr/bin/env node

/**
 * Content Repurposing Script
 * Reads article frontmatter and generates social media posts.
 * Run: node content-repurposer.js [slug]
 *
 * Generates:
 * - 3 tweet drafts
 * - 2 LinkedIn post drafts
 * - 1 newsletter blurb
 */

import fs from 'node:fs';
import path from 'node:path';

const ARTICLES_DIR = path.join(process.cwd(), '..', 'src', 'content', 'articles');
const SITE = 'https://perspectiveai.xyz';

function parseArticle(slug) {
  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    console.error(`Article not found: ${slug}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;

  const fm = frontmatterMatch[1];
  const get = (key) => {
    const m = fm.match(new RegExp(`^${key}: "(.+)"`, 'm'));
    return m ? m[1] : '';
  };

  // Get FAQs
  const faqMatch = content.match(/faqs:\n([\s\S]*?)(?=\n[a-zA-Z]|\n---)/);
  const faqs = [];
  if (faqMatch) {
    const faqLines = faqMatch[1].match(/question: "([^"]+)"/g);
    if (faqLines) faqs.push(...faqLines.map(l => l.replace('question: "', '').replace('"', '')));
  }

  return {
    title: get('title'),
    description: get('description'),
    tldr: get('tldr'),
    category: get('categoryTag'),
    slug,
    url: `${SITE}/${slug}/`,
    faqs: faqs.slice(0, 3),
  };
}

function generateTweets(article) {
  return [
    // Hook + value + link
    `${article.title}\n\nTL;DR: ${article.tldr.substring(0, 200)}${article.tldr.length > 200 ? '...' : ''}\n\n${article.url}`,

    // Question format
    article.faqs[0]
      ? `${article.faqs[0]}\n\nWe tested and compared the top options.\n\n${article.url}`
      : `Which AI tool is best for your use case?\n\nWe ranked and compared them all.\n\n${article.url}`,

    // Stats/data hook
    `New: ${article.title}\n\nUpdated for April 2026 with latest benchmarks and pricing.\n\n${article.url}`,
  ];
}

function generateLinkedIn(article) {
  return [
    // Authority post
    `${article.title}\n\nWe tested and compared the leading options to help you make the right choice.\n\nKey findings:\n${article.faqs.map(q => `→ ${q}`).join('\n')}\n\nFull comparison with pricing and benchmarks:\n${article.url}`,

    // Problem/solution
    `Choosing the right AI tool is harder than ever in 2026.\n\n${article.description}\n\nWe did the research so you don't have to:\n${article.url}`,
  ];
}

function generateNewsletter(article) {
  return `**${article.title}**\n\n${article.description}\n\n[Read the full comparison →](${article.url})`;
}

// Main
const slug = process.argv[2];
if (!slug) {
  // List available articles
  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''));
  console.log(`Usage: node content-repurposer.js <slug>\n\nAvailable articles (${files.length}):`);
  files.slice(0, 20).forEach(f => console.log(`  ${f}`));
  if (files.length > 20) console.log(`  ... and ${files.length - 20} more`);
  process.exit(0);
}

const article = parseArticle(slug);
if (!article) process.exit(1);

console.log(`\n📝 Content Repurposing: ${article.title}`);
console.log(`   Category: ${article.category} | URL: ${article.url}\n`);

console.log('━━━ TWEETS (pick 1-2) ━━━\n');
generateTweets(article).forEach((tweet, i) => {
  console.log(`Tweet ${i + 1} (${tweet.length} chars):`);
  console.log(tweet);
  console.log();
});

console.log('━━━ LINKEDIN (pick 1) ━━━\n');
generateLinkedIn(article).forEach((post, i) => {
  console.log(`LinkedIn ${i + 1}:`);
  console.log(post);
  console.log();
});

console.log('━━━ NEWSLETTER BLURB ━━━\n');
console.log(generateNewsletter(article));
console.log();
