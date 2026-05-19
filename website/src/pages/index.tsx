import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const INSTALL = 'git clone https://github.com/TabletopFoundry/rules-genie && cd rules-genie && npm install && npm run dev';

function Hero() {
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    void navigator.clipboard.writeText(INSTALL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <header className="hero--rg">
      <div className="container" style={{ textAlign: 'center' }}>
        <h1 className="heroTitle">
          Stop flipping through rulebooks.<br />
          <span className="accent">Get the ruling in seconds.</span>
        </h1>
        <p className="heroSub">
          RulesGenie is an AI-powered board game rules assistant. Ask plain-English
          questions, get citation-backed answers, and keep the game moving — with{' '}
          <strong>zero API keys required</strong> to start.
        </p>
        <div className="heroCtas">
          <Link className="btnPrimary" to="/docs/getting-started/quick-start">
            🚀 Get started
          </Link>
          <Link className="btnGhost" to="https://github.com/TabletopFoundry/rules-genie">
            ⭐ Star on GitHub
          </Link>
          <Link className="btnGhost" to="/docs/why">
            Why RulesGenie?
          </Link>
        </div>
        <div className="installRow">
          <code>$ git clone … && npm install && npm run dev</code>
          <button className="copyBtn" onClick={onCopy} aria-label="Copy install command">
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span className="demoChip">Next.js 15</span>
          <span className="demoChip">TypeScript 5.8</span>
          <span className="demoChip">SQLite</span>
          <span className="demoChip">OpenAI (optional)</span>
          <span className="demoChip">MIT licensed</span>
        </div>
      </div>
    </header>
  );
}

const FEATURES = [
  {
    icon: '🤖',
    title: 'Citation-backed AI answers',
    body:
      'Ask in natural language. Every answer ships with confidence scoring, source citations, and game-aware session memory.',
  },
  {
    icon: '⚡',
    title: 'Zero-config demo mode',
    body:
      'Works out of the box with a keyword-scored mock engine — no API keys, no signup, no waiting. Perfect for offline game nights.',
  },
  {
    icon: '📚',
    title: '35 games, ready on day one',
    body:
      'A curated catalog from gateway games to heavyweight Euros. Add your own with a single TypeScript record.',
  },
  {
    icon: '🔌',
    title: 'OpenAI when you want it',
    body:
      'Drop in an OPENAI_API_KEY and the same UI now answers with GPT-4o-mini. No code changes required.',
  },
  {
    icon: '🛡️',
    title: 'Production-grade defaults',
    body:
      'Zod validation, CSRF middleware, parameterized SQL, standalone Docker output, and a health endpoint — already wired up.',
  },
  {
    icon: '🔖',
    title: 'Bookmarks & quick-starts',
    body:
      'Save the rulings you reference often. Compress whole rulebooks into 60-second teaches the next time you open a box.',
  },
];

function Features() {
  return (
    <section className="features">
      <div className="container">
        <h2 className="sectionTitle">Everything you need for fast mid-game rulings</h2>
        <p className="sectionLead">
          Built to answer the one question that always breaks the flow: <em>“wait, can I actually do that?”</em>
        </p>
        <div className="featureGrid">
          {FEATURES.map((f) => (
            <div className="featureCard" key={f.title}>
              <div className="featureIcon" aria-hidden>
                <span style={{ fontSize: '1.4rem' }}>{f.icon}</span>
              </div>
              <div className="featureTitle">{f.title}</div>
              <div className="featureBody">{f.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Demo() {
  return (
    <section className="demoSection">
      <div className="container" style={{ maxWidth: 880 }}>
        <h2 className="sectionTitle">A real ruling, in one round trip</h2>
        <p className="sectionLead">
          This is what comes back from <code>POST /api/ask</code> in demo mode — no API key, no waiting.
        </p>
        <div className="demoCard">
          <div className="demoBubble user">
            <strong>You · Ticket to Ride</strong>
            <div>Can I draw a face-up locomotive first, then a regular train card?</div>
          </div>
          <div className="demoBubble bot">
            <strong>RulesGenie</strong>
            <div>
              No. Drawing a face-up <em>locomotive</em> counts as your entire turn — you cannot then draw a
              second card. Locomotives are only “free” when you take them from the deck face-down.
            </div>
            <div className="demoMeta">
              <span className="demoChip">✅ Confidence: high</span>
              <span className="demoChip">📖 Source: Ticket to Ride · Rulebook p. 4</span>
              <span className="demoChip">⚡ Mode: demo</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link className="btnPrimary" to="/docs/getting-started/first-question">
            Walk through this in 5 minutes →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): React.ReactElement {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} — AI rules assistant for board games`}
      description="Ask board game rules questions in plain English. Citation-backed answers in seconds. Works without an API key."
    >
      <Hero />
      <Features />
      <Demo />
    </Layout>
  );
}
