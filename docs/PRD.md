# Gap Analysis + Enhanced PRD: RulesGenie — AI-Powered Board Game Rules Assistant

## Gap Analysis

| Dimension | Gaps in original PRD | Resolution in enhanced PRD |
|---|---|---|
| Vague requirements without measurable criteria | Terms such as “instant,” “accurate,” “mobile-first,” “confidence scoring,” and “community verification” were not defined with thresholds, latency targets, or operational rules. | Adds measurable KPIs, latency targets, confidence behavior, coverage limits, freshness SLAs, and concrete browser/device support. |
| Missing user stories | Original PRD listed features but did not express who needed them, why, or under what workflow. | Adds persona-linked user stories for each in-scope feature. |
| Undefined edge cases | No handling was defined for unsupported games, conflicting sources, ambiguous wording, multiple editions, expansions, OCR failures, low-confidence answers, or expired conversation context. | Adds explicit edge cases and fallback behavior for every functional requirement. |
| Missing acceptance criteria | No Given/When/Then criteria existed, making implementation and QA ambiguous. | Adds testable acceptance criteria for each requirement. |
| Implicit assumptions | Assumed rulebook ingestion rights, source authority ranking, supported platforms, language support, account model, and answer freshness without saying so. | Makes assumptions explicit and tags inferred defaults with [INFERRED] and unresolved items with [NEEDS INPUT]. |
| Contradictions | “Any board game” conflicted with phased launch of top 200 games; “mobile-first” conflicted with Phase 1 web-only MVP; free tier listed top 100 games while MVP launch listed top 200; community verification was positioned as key while Phase 1 only mentioned collecting feedback. | Narrows v1 scope to a web beta for ~200 supported games, separates future scope, and clarifies that v1 feedback is lightweight while full community verification is deferred. |
| Missing NFRs | Performance, uptime, security, accessibility, privacy, compliance, i18n, retention, and browser support were largely absent. | Adds measurable NFRs with targets and explicit policies/defaults. |
| Missing scope boundaries | Original PRD mixed MVP, growth, and platform ambitions without a clear v1 boundary. | Separates in-scope v1, out-of-scope v1, and future considerations. |
| Missing prioritization | All features were presented as important, with no MoSCoW prioritization. | Assigns Must-have/Should-have/Nice-to-have priorities and ties them to v1 rollout. |
| Missing metrics | Original success metrics were mostly business-level year-1 outcomes and lacked product quality and operations metrics. | Adds product KPIs, helpfulness, citation coverage, latency, and rollout guardrails. |
| Missing data model and ownership | No conceptual data entities, relationships, or ownership/privacy boundaries were defined. | Adds a conceptual data model, ownership rules, and PII flags. |
| Missing release guardrails | No migration, rollback triggers, or phased release quality gates were defined. | Adds alpha/beta rollout plan, migration approach, and rollback criteria. |

### 1. Overview

- **Product name:** RulesGenie
- **One-line description:** AI assistant that answers board game rules questions with citations.
- **Problem statement with evidence:** Board game rulebooks are often 10-40 pages long, first-time learning frequently takes 30-60 minutes, and existing alternatives are inefficient: tutorial videos take 20-40 minutes and cannot answer situational questions, forum responses are delayed, and general-purpose AI can hallucinate or ignore edition-specific rules. This creates the biggest recurring friction in modern tabletop play: stopping the game to interpret rules.
- **Proposed solution:** A responsive web application that lets players select a supported game, ask natural-language rules questions, and receive sourced answers grounded in the correct rulebook edition plus official FAQ/errata. v1 focuses on trusted, citation-backed Q&A for ~200 supported games, lightweight answer feedback, and an admin ingestion workflow [INFERRED]. Features from the original vision such as quick-start teaching, setup guides, voice input, BGG sync, and publisher APIs remain future work unless explicitly stated otherwise [INFERRED].
- **Success metrics:**
  1. **Answer accuracy:** ≥95% of sampled answers for supported games are rated correct by internal review and/or publisher/community validation.
  2. **Answer latency:** p95 time from question submission to rendered answer is **<5 seconds**; p99 is **<8 seconds**.
  3. **Citation coverage:** ≥98% of answerable queries return at least one visible citation to rulebook, FAQ, or errata source.
  4. **User helpfulness:** ≥80% of submitted answer ratings are positive within the public beta period.

### 2. Users & Personas

| Persona | Name / Role | Goals | Pain points | Tech comfort level |
|---|---|---|---|---|
| Primary | **Core Hobbyist Gamer** — plays weekly, owns 20-200+ games | Resolve edge cases quickly, reduce teach time, avoid rule disputes, verify expansions/editions | Complex games have dense rules; forums are slow; generic AI is untrusted mid-game | High |
| Secondary | **Casual / New Player** — plays monthly with friends or family | Learn enough rules to start playing, avoid embarrassment, answer simple “can I do X?” questions | Rulebooks feel intimidating; setup and terminology are confusing | Medium |
| Tertiary | **Board Game Café / FLGS Staff Member** — teaches many titles to customers | Get fast, repeatable answers without memorizing every game | Staff turnover, large catalog, frequent interruptions during demos | Medium |
| Quaternary | **Publisher / Rules Owner** — maintains official rulings for a title | Reduce inbound rules questions, improve trust in digital rules support, distribute errata clearly | Rule clarifications are fragmented across PDFs, FAQs, and forum posts | High |

### 3. Scope

#### In scope (v1)
1. Responsive **web app only** for desktop and mobile browsers [INFERRED from original Phase 1 MVP].
2. Support for approximately **200 launch titles**, prioritized by BGG popularity/rank and publisher-licensed content [INFERRED].
3. Search and select a supported game before asking questions.
4. Allow users to specify edition and included expansions when that metadata exists.
5. Natural-language rules Q&A grounded in ingested sources.
6. Answers must include visible citations to rulebook pages/sections and, when available, official FAQ or errata.
7. Confidence/ambiguity handling: definitive answer only when source support is sufficient; otherwise present uncertainty.
8. Multi-turn conversation context within a single game session.
9. Lightweight answer feedback (thumbs up/down + optional reason) to support beta quality improvement.
10. Internal/admin workflow to ingest and refresh source content for supported games.

#### Out of scope (v1)
1. **Native iOS/Android apps** — deferred because original MVP phase specifies web-only launch.
2. **Voice input / Siri / Google Assistant integration** — deferred to reduce scope and because real-time voice UX is not required to validate trust in Q&A.
3. **Interactive setup guide** — valuable, but separate content-authoring burden from core Q&A engine.
4. **Quick-start “teach me in 5 minutes” mode** — useful but distinct summarization workflow; defer until citation-backed Q&A proves accuracy.
5. **Full community verification system** (publisher “gold” answers, public edge-case contributions) — v1 captures feedback only; moderation workflows are not in scope.
6. **BGG collection sync** — deferred due to account/auth complexity and non-essentiality for core rules-answering value.
7. **Offline mode** — deferred because v1 is validating online answer quality and source freshness.
8. **Publisher API / embedded SDK / café kiosk mode** — future B2B expansion, not part of initial beta.
9. **International language support beyond English UI/content** — deferred until English corpus accuracy is stable.
10. **Coverage of “any board game”** — explicitly out of scope for v1; only supported games with ingested sources are queryable.

#### Future considerations (v2+)
- Quick-start mode with progressive disclosure.
- Interactive setup wizard with player-count-specific setup.
- Voice-first mid-game referee mode.
- Community verification with moderation and publisher-verified rulings.
- BGG collection sync and game-night preparation workflows.
- Native mobile apps.
- Publisher API / embedded FAQ experiences.
- Café/FLGS kiosk mode.
- Internationalized UI and multilingual source corpora.

#### Prioritization summary (MoSCoW)
- **Must-have (v1):** Supported game selection, citation-backed Q&A, edition/expansion scoping, session context, honest low-confidence handling, answer feedback capture, source ingestion/refresh.
- **Should-have:** None in v1 by design; scope is intentionally constrained to maximize answer trust and implementation clarity.
- **Could-have / Nice-to-have:** Quick-start mode, setup guide, voice input, BGG sync, public verification, API/kiosk deployment, native mobile apps, multilingual support.
- **Won't-have (v1):** Any feature listed in the out-of-scope section above.

### 4. Functional Requirements

#### FR-001 — Supported Game Selection
- **User story:** As a player, I want to select the exact game I am playing so that answers are scoped to the correct rules corpus.
- **Description:** Users must start a session by searching for and selecting a supported game. If multiple editions exist, the selection flow must expose those distinctions. If the title is unsupported, the product must clearly say so instead of attempting an answer.
- **Acceptance criteria:**
  - **Given** a user types at least 3 characters of a supported game title, **when** matches exist, **then** the UI returns matching games within **500 ms p95** and shows title plus edition label where available.
  - **Given** a selected game has multiple editions or supported expansions, **when** the user opens the game session, **then** the UI prompts for edition and optional expansion context before the first question.
  - **Given** a searched game is not supported, **when** no indexed title matches, **then** the UI shows “Game not yet supported” and blocks question submission for that title.
- **Edge cases:** Alternate spellings; same title across editions; reimplemented titles; user skips edition selection; unsupported fan expansions.
- **Priority:** Must-have
- **Dependencies:** Game catalog metadata; content ingestion pipeline; search index.

#### FR-002 — Citation-Backed Rules Answering
- **User story:** As a player, I want to ask a rules question in plain English so that I can keep playing without reading the entire rulebook.
- **Description:** The system must accept free-form rules questions and generate answers using retrieval-augmented generation grounded in approved source content only. Answers must be concise enough for mid-game use and include visible supporting citations.
- **Acceptance criteria:**
  - **Given** a supported game and an answerable rules question, **when** the user submits the question, **then** the system returns an answer with at least one citation within **5 seconds p95**.
  - **Given** multiple supporting sources exist, **when** the answer is rendered, **then** the UI lists the top supporting citations in priority order: official rulebook, official FAQ, official errata, then clearly-labeled community source [INFERRED from original source strategy].
  - **Given** the model cannot ground a claim in retrieved content, **when** generating the answer, **then** the unsupported claim must not be presented as fact.
- **Edge cases:** Compound questions with two rulings; questions containing strategy rather than rules; OCR errors in source text; citations to obsolete errata.
- **Priority:** Must-have
- **Dependencies:** LLM provider; retrieval layer; source normalization; citation renderer.

#### FR-003 — Edition and Expansion Awareness
- **User story:** As a core hobbyist, I want answers to reflect my game’s edition and active expansions so that I do not apply the wrong rule set.
- **Description:** The answer pipeline must filter retrieval based on selected edition and declared expansions. If no edition is selected, the system must either infer safely from available metadata or prompt the user to choose.
- **Acceptance criteria:**
  - **Given** a game with multiple editions, **when** the user selects an edition, **then** retrieval excludes chunks from other editions unless explicitly cross-referenced.
  - **Given** an expansion is selected, **when** a question depends on expansion rules, **then** the answer includes the expansion source citation.
  - **Given** the user has not specified edition and the answer differs by edition, **when** the question is submitted, **then** the system asks for clarification instead of guessing.
- **Edge cases:** Mixed base game + expansion terms in user text; renamed components between editions; expansion content referenced when not selected.
- **Priority:** Must-have
- **Dependencies:** Game/edition metadata; source tagging; session state.

#### FR-004 — Multi-Turn Session Context
- **User story:** As a player, I want to ask follow-up questions without restating the full situation so that the interaction feels fast during play.
- **Description:** Within an active session, the system must maintain game, edition, expansion, and recent conversational context. Context should expire after inactivity to avoid stale assumptions.
- **Acceptance criteria:**
  - **Given** a user has already asked a question in a session, **when** they ask a follow-up using pronouns or shorthand (for example, “What if I already played one?”), **then** the system resolves the reference using the prior 10 turns or asks for clarification if resolution confidence is low.
  - **Given** a session has been inactive for **30 minutes** [INFERRED], **when** the user returns, **then** the UI requires confirmation before reusing old context.
  - **Given** the user starts a new game session, **when** the game changes, **then** previous game context must not carry over.
- **Edge cases:** Two tabs open on different games; follow-up references to older turns; contradictory clarifications from the user.
- **Priority:** Must-have
- **Dependencies:** Session service; conversation store; frontend session-state handling.

#### FR-005 — Ambiguity, Low-Confidence, and Unsupported-Source Handling
- **User story:** As a player, I want the system to be honest when the rules are unclear so that I can decide how to proceed rather than trust a hallucinated answer.
- **Description:** The system must distinguish between high-confidence answers, ambiguous answers, conflicting-source answers, and unsupported questions. The product should prefer clarity over false certainty.
- **Acceptance criteria:**
  - **Given** retrieved sources conflict, **when** the answer is rendered, **then** the UI labels the answer as “conflicting sources,” shows the conflicting citations, and avoids a single definitive ruling.
  - **Given** answer confidence falls below the configured threshold [INFERRED default: **0.70**], **when** generation completes, **then** the UI labels the response as low confidence and suggests clarifying inputs such as edition, expansion, or exact card/component name.
  - **Given** the question is outside official rules scope (for example, strategy advice or house rules), **when** the system detects that case, **then** it states that the response is not an official rules ruling.
- **Edge cases:** User asks for “best move”; official rules are silent; FAQ supersedes rulebook wording; publisher rulings differ by print run.
- **Priority:** Must-have
- **Dependencies:** Confidence scoring; source ranking; UX states for ambiguous answers.

#### FR-006 — Answer Feedback Capture
- **User story:** As a beta user, I want to rate an answer so that inaccurate or confusing responses improve over time.
- **Description:** Each answer must support lightweight feedback capture. v1 feedback is private to the product team and not yet a public verification layer.
- **Acceptance criteria:**
  - **Given** an answer is displayed, **when** the user selects thumbs up or thumbs down, **then** the event is stored with answer ID, game ID, source set, and timestamp.
  - **Given** the user submits negative feedback, **when** prompted, **then** they can optionally choose a reason from a fixed list: “incorrect ruling,” “wrong edition,” “unclear explanation,” or “bad citation” [INFERRED].
  - **Given** a user has already rated an answer, **when** they try to rate it again from the same session, **then** the latest rating overwrites the prior rating rather than creating duplicates.
- **Edge cases:** Anonymous sessions; accidental duplicate taps; feedback submitted while offline; abuse/spam submissions.
- **Priority:** Must-have
- **Dependencies:** Analytics/event store; answer IDs; basic rate limiting.

#### FR-007 — Source Ingestion and Refresh [INFERRED]
- **User story:** As an operations/admin user, I want to ingest rulebooks, FAQs, and errata by game and edition so that player-facing answers stay current and attributable.
- **Description:** The system must provide an internal workflow to upload or register source documents, extract text, tag them to game/edition/expansion, and index them for retrieval. Refresh behavior must support revised errata without mixing source versions.
- **Acceptance criteria:**
  - **Given** an admin uploads a new source document, **when** processing succeeds, **then** the document is stored with source type, version date, game/edition mapping, and index status.
  - **Given** a new FAQ or errata file supersedes an older one, **when** it is marked active, **then** retrieval prioritizes the active version and preserves the old version for audit history.
  - **Given** processing fails due to OCR or parsing error, **when** the pipeline stops, **then** the admin sees a failure reason and the failed content is not exposed to end users.
- **Edge cases:** Scanned image PDFs; malformed metadata; duplicate uploads; partial source updates; copyrighted content without approved rights [NEEDS INPUT].
- **Priority:** Must-have
- **Dependencies:** Admin UI or internal tooling; document storage; OCR/parser; embedding pipeline; vector database.

### 5. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Performance | Search suggestions must return in **≤500 ms p95**. Answer generation must render in **<5 s p95** and **<8 s p99** for supported games under nominal load. Retrieval-only failures must surface a user-visible error in **<2 s** rather than hanging indefinitely. |
| Throughput | v1 must support **200 concurrent active sessions** and **20 requests/second burst** without breaching latency targets [INFERRED]. Architecture must scale to **10x load (2,000 active sessions)** via horizontal API scaling with no product rewrite, and a **100x load (20,000 active sessions)** via vector index sharding/partitioning [INFERRED]. |
| Availability | Public query service SLA for beta: **99.5% monthly uptime**, excluding scheduled maintenance announced at least 24 hours in advance [INFERRED]. Internal ingestion may be lower at **99.0%**. |
| Scalability | Content model must support at least **200 launch games**, **500 editions/expansions**, and **100,000 indexed chunks** in v1 [INFERRED]. Schema and indexing must avoid coupling answers to a single source version so new errata can be activated without full product downtime. |
| Security | Player-facing Q&A may be used anonymously in beta [INFERRED], but any saved history/admin operations require authenticated access. Default auth model: email magic link or OAuth for end users [INFERRED]; role-based access control for admin ingestion. All data in transit must use TLS 1.2+; source documents and user data encrypted at rest with provider-managed keys at minimum. Rate limiting required on query and feedback endpoints. |
| Compliance | Product must be designed for **GDPR/CCPA-ready** deletion/export workflows if accounts are enabled [INFERRED]. Rulebook usage must follow licensed access or defensible excerpting policy; v1 must expose only short answer snippets and citations, not full-text rulebook downloads. A takedown workflow for disputed content is required [INFERRED]. |
| Accessibility | Web UI must meet **WCAG 2.1 AA** for keyboard navigation, contrast, visible focus, semantic headings, and screen-reader-readable citations. Interactive elements must remain usable at **320 px** viewport width. |
| Internationalization | v1 UI and content are **English-only**. Text strings must be externalized to localization files so non-English UI can be added later without component rewrites [INFERRED]. Source metadata must support locale tags even if only `en-US` is used in v1. |
| Data retention & privacy | Anonymous session data retained for **30 days**; authenticated query history retained for **180 days** by default; feedback events retained for **24 months** for quality analysis [INFERRED]. Users must be able to delete saved history if accounts exist [NEEDS INPUT on final policy]. Query logs may contain free text and must be treated as potentially sensitive user content. |
| Browser / device support | Support latest two stable versions of **Chrome, Safari, Firefox, and Edge** on desktop plus mobile Safari/Chrome on iOS/Android. No IE support. Responsive layouts must support **320 px to 1440+ px** widths. |
| Observability | System must log request ID, game ID, source IDs, confidence score, latency, and answer outcome for every query. Alerting required when answer error rate exceeds **2%** or citation coverage drops below **95%** over a rolling 1-hour window [INFERRED]. |

### 6. User Flows

#### Flow 1 — Start a supported game session and ask a first question
- **Happy path:**
  1. User opens the web app.
  2. User searches for a game title.
  3. User selects the correct title, edition, and optional expansions.
  4. User enters a natural-language rules question.
  5. System retrieves supporting sources, generates answer, and renders citations.
  6. User continues play.
- **Error / alternate paths:**
  - No matching supported game → show unsupported state; no answer attempt.
  - Multiple editions but none selected → prompt for edition before submission.
  - Retrieval timeout → show retry state and preserve typed question.
- **State transitions:** `Landing -> GameSearch -> GameSelected -> ContextScoped -> QuerySubmitted -> AnswerRendered`

#### Flow 2 — Ask a follow-up question in the same session
- **Happy path:**
  1. User reads the first answer.
  2. User asks a shorthand follow-up question.
  3. System resolves context from prior turns.
  4. System returns an answer citing the relevant source.
- **Error / alternate paths:**
  - Context resolution is ambiguous → ask clarifying question.
  - Session expired after inactivity → prompt to confirm or restart context.
- **State transitions:** `AnswerRendered -> FollowUpSubmitted -> ContextResolved -> AnswerRendered` or `FollowUpSubmitted -> ClarificationNeeded`

#### Flow 3 — Handle ambiguous or conflicting rules
- **Happy path:**
  1. User submits a question with conflicting or incomplete source support.
  2. System detects conflicting citations or low confidence.
  3. System shows an uncertainty label, supporting citations, and suggested clarifiers.
  4. User either clarifies the question or decides on a table ruling.
- **Error / alternate paths:**
  - No authoritative source exists → answer states that official guidance is unavailable.
  - User requests strategy/house-rule advice → answer is labeled non-official.
- **State transitions:** `QuerySubmitted -> EvidenceAssessed -> LowConfidenceRendered -> ClarificationSubmitted` or `QuerySubmitted -> UnsupportedOfficialRuling`

#### Flow 4 — Submit answer feedback
- **Happy path:**
  1. User reads an answer.
  2. User taps thumbs up or thumbs down.
  3. If negative, user optionally selects a reason.
  4. System stores the feedback and confirms receipt.
- **Error / alternate paths:**
  - Network failure during submission → queue retry or show retry CTA.
  - User changes mind → latest rating overwrites prior one.
- **State transitions:** `AnswerRendered -> FeedbackInitiated -> FeedbackCaptured`

#### Flow 5 — Admin ingests or updates a rules source [INFERRED]
- **Happy path:**
  1. Admin uploads a rulebook/FAQ/errata source.
  2. System extracts text and metadata.
  3. Admin reviews game/edition mapping.
  4. System indexes content and marks source active.
  5. User queries begin using the new source version.
- **Error / alternate paths:**
  - OCR/parsing failure → source remains inactive and error is logged.
  - Duplicate or superseded source → admin must confirm replacement.
- **State transitions:** `SourceUploaded -> Processing -> ReviewPending -> Indexed -> Active`

### 7. Data Model (Conceptual)

| Entity | Description | Key relationships | Ownership / access rules | PII |
|---|---|---|---|---|
| User | Optional end-user account for saved history/preferences | 1 user -> many sessions, feedback events | User can view/delete own saved data; admins cannot view raw user content except for support/compliance workflows [NEEDS INPUT] | **Yes**: email, auth ID |
| Session | A game-scoped interaction context | Many queries per session; belongs to 0..1 user; exactly 1 active game selection | Anonymous sessions are ephemeral; authenticated sessions may persist per retention policy | No direct PII, but linked to user ID |
| Game | Canonical board game record | 1 game -> many editions, expansions, source documents | Product-owned metadata | No |
| Edition | Specific printing/version of a game | Belongs to game; many sources; many sessions | Product-owned metadata; required for scoping where rules differ | No |
| Expansion | Optional rules set layered onto a base game | Belongs to game/edition; linked to sources and sessions | Product-owned metadata | No |
| SourceDocument | Rulebook, FAQ, errata, or approved community source | Belongs to game/edition/expansion; many source chunks | System stores metadata and access rights; only approved documents are queryable | No |
| SourceChunk | Indexed segment of source text used for retrieval | Belongs to source document; many answers may cite it | Internal-only retrieval object | No |
| Query | User-submitted question text | Belongs to session; produces 0..1 answer | Stored per retention policy; may contain incidental personal text | **Potentially yes** (free text) |
| Answer | Generated response + confidence + citations | Belongs to query; references many source chunks | Visible to querying user; internal logs retain evidence | No |
| FeedbackEvent | User rating on an answer | Belongs to answer and optionally user/session | Internal-only quality signal in v1 | No direct PII beyond linked identifiers |
| IngestionJob [INFERRED] | Processing record for a source upload/update | Belongs to source document | Admin-only | No |

**Data ownership / access rules**
- Official source metadata and normalized embeddings are owned/operated by the product, subject to publisher/license constraints.
- Users own their account information and any saved history tied to their account.
- Anonymous sessions are not portable between devices unless [NEEDS INPUT] anonymous session recovery is later added.
- Admin-only tools can manage source documents, ingestion status, and audit history, but should not expose unnecessary user query content.

### 8. Integration Points

| Integration | Purpose | Direction | v1 status | Notes |
|---|---|---|---|---|
| LLM provider (e.g., GPT-4 / Claude) [INFERRED] | Generate final answer from retrieved evidence | Outbound API | In scope | Must support citation-aware prompting and latency monitoring. |
| Vector database (e.g., Pinecone / Weaviate) [INFERRED] | Store and retrieve embeddings for source chunks | Outbound API / managed service | In scope | Must filter by game, edition, expansion, and source type. |
| OCR / document parsing service [INFERRED] | Extract text from PDFs and scanned rulebooks | Outbound API or internal service | In scope | Required for ingestion of image-based rulebooks. |
| Document/object storage [INFERRED] | Store source files and normalized artifacts | Internal/managed | In scope | Must version uploaded sources. |
| Analytics / event pipeline [INFERRED] | Capture latency, helpfulness, and error metrics | Internal/managed | In scope | Needed for KPI tracking and rollback triggers. |
| Email/OAuth identity provider [INFERRED] | Optional authentication for saved history/admin access | Outbound API | In scope if accounts ship in beta | Final provider choice is [NEEDS INPUT]. |
| BoardGameGeek collection sync | Import owned games / personalize library | Outbound API | Out of scope for v1 | Keep data model extensible for later account linking. |
| Publisher content feeds / API | Receive official rulebook/FAQ updates | Inbound | Out of scope for v1 public release | v1 may rely on manual or semi-manual ingestion. |

**Internal event contracts [INFERRED]**
- `query.answered`
  - Payload: `query_id`, `game_id`, `edition_id`, `answer_id`, `confidence_score`, `latency_ms`, `citation_count`, `outcome_status`
- `answer.feedback_submitted`
  - Payload: `answer_id`, `session_id`, `user_id|null`, `rating`, `reason_code|null`, `timestamp`
- `source.ingestion_completed`
  - Payload: `source_document_id`, `game_id`, `edition_id`, `source_type`, `version_label`, `chunk_count`, `status`, `completed_at`

**Webhook / external contract notes**
- No external customer-facing webhooks are required in v1.
- If publisher integrations are added later, they should consume stable source/version events rather than raw ingestion internals.

### 9. UX/UI Requirements

#### Key screens
1. **Landing / Game Search**
   - Prominent search bar.
   - Search results show game title, thumbnail if available [INFERRED], and edition label.
   - Unsupported titles must show a clear “not yet supported” state.
2. **Rules Q&A Session Screen**
   - Persistent header with selected game, edition, and active expansions.
   - Main conversation area shows question/answer pairs.
   - Citations must be visible inline or one tap away; they cannot be hidden behind deep navigation.
3. **Low-Confidence / Conflict State**
   - Distinct visual treatment from standard answers.
   - Must list why confidence is low (missing edition, conflicting sources, no official ruling, etc.).
4. **Feedback UI**
   - Thumbs up/down attached to each answer.
   - Negative feedback follow-up must require no more than 2 taps after the initial vote.
5. **Admin Source Management [INFERRED]**
   - Upload or register new sources.
   - View ingestion status, source mapping, and failures.

#### Design constraints
- Responsive, mobile-web-first layout for use at a game table.
- One-handed use should be possible on common phone widths.
- Text must remain readable in low-light indoor settings [INFERRED], but dark mode is optional unless design system already supports it [NEEDS INPUT].
- Answers should favor scannability: short paragraphs, bullet lists when appropriate, and citation labels.
- The product must not require users to navigate away from the answer screen to verify evidence.

#### Loading / empty / error states
- **Loading:** Show a progress state within **250 ms** of question submit; keep prior conversation visible.
- **Empty state:** Before first question, display 2-4 example questions relevant to the selected game [INFERRED] or generic prompts if game-specific examples are unavailable.
- **No citation state:** Not allowed for answerable official-rules questions; instead show unsupported/low-confidence state.
- **Network error:** Preserve the typed question, show retry CTA, and avoid duplicate submissions.
- **Unsupported game state:** Clearly state support limitation and do not attempt fabricated answers.

### 10. Release & Rollout

#### Rollout strategy
1. **Internal alpha**
   - Launch with ~20 games and manually reviewed answers.
   - Validate source ingestion, citation rendering, and low-confidence behavior.
2. **Closed beta**
   - Expand to ~200 supported games.
   - Invite core hobbyists, select cafés, and publisher partners [INFERRED from GTM intent].
   - Keep product free while collecting accuracy/helpfulness data.
3. **Public beta**
   - Open self-serve web access with rate limits.
   - Monitor helpfulness, citation coverage, and latency against KPIs.

#### Migration plan
- No legacy user migration is required because v1 is a new product.
- Content migration occurs through batch ingestion of launch games.
- All source documents must be versioned so new errata can be activated without deleting prior audit history.
- Re-indexing jobs should run per game/edition, not as all-or-nothing global rebuilds [INFERRED].

#### Rollback criteria
Rollback a release or disable newly ingested content if any of the following hold for more than 30 minutes:
1. Answer error rate exceeds **2%**.
2. Citation coverage drops below **95%**.
3. p95 answer latency exceeds **8 seconds**.
4. Verified answer accuracy for a newly released game drops below **90%** in review samples.
5. Legal/compliance issue is raised on a newly ingested source and content rights cannot be confirmed.

### 11. Open Questions

| Open question | Why it matters | Proposed default |
|---|---|---|
| Which content sources are authoritative in conflict cases? [NEEDS INPUT] | Determines trust model and ranking logic. | Use priority order: official rulebook -> official errata -> official FAQ -> clearly labeled community discussion. |
| What rights model allows storing and indexing rulebook text? [NEEDS INPUT] | Copyright risk is one of the highest product risks. | Launch only with licensed, public-domain, or otherwise approved source documents; expose excerpts, not downloadable full text. |
| Are user accounts required in public beta? [NEEDS INPUT] | Impacts auth complexity, retention, rate limits, and feedback attribution. | Allow anonymous Q&A in beta with rate limits; require account only for saved history/admin access. |
| How should unsupported games be handled commercially? [NEEDS INPUT] | Affects user frustration and roadmap prioritization. | Show unsupported state; do not fabricate answers; capture demand internally if a request queue is later added. |
| Should quick-start mode be part of v1 if schedule permits? [NEEDS INPUT] | It is in the original vision but not necessary for validating core trust. | Defer from v1 unless core Q&A accuracy and citation targets are met early. |
| What is the final retention policy for saved histories and query logs? [NEEDS INPUT] | Needed for privacy policy and backend design. | Use 30-day anonymous retention and 180-day authenticated retention until legal review says otherwise. |
| Will community feedback be visible publicly in v1? [NEEDS INPUT] | Changes moderation and social trust requirements. | No; keep feedback internal in v1 and expose public verification only in a later phase. |
| Which identity provider and analytics stack should be used? [NEEDS INPUT] | Affects engineering choices and compliance reviews. | Choose managed providers that support audit logging, RBAC, and deletion/export workflows. |
