# Homepage Review Template (Read-Only)

Audience: **LLM reviewers only** (Web Designer / Copywriter / Red Team)
Mode: **Read-only audit** — no code changes, no rewrites, no commits.
Scope: **Homepage only**. Section order and existence are fixed.

---

## 0) Review Metadata

- Reviewer role: **Copywriter**
- Model: Claude Opus 4.5 (claude-opus-4-5-20251101)
- Date: 2026-01-13
- Repo / site: /Users/zhaoyub/Documents/GitHub/GitHubpage/zbaiy.github.io
- Homepage entrypoint(s): src/components/Home.js (content), src/components/Header.js, src/components/Footer.js

---

## 1) Section Map (As-Is)

| Order | Section name / anchor | File | Lines (approx) | One-line purpose |
|---:|---|---|---|---|
| 1 | Header | Header.js | 5-29 | Site identity ("BART BAI") + navigation (Home, SoionLab, Projects) |
| 2 | Hero | Home.js | 6-21 | Primary value proposition + navigation CTAs |
| 3 | About | Home.js | 24-36 | Brief bio and research framing |
| 4 | Footer | Footer.js | 5-21 | Social links, email, copyright |

Notes:
- No additional implicit sections detected.
- Hero and About are distinct sections within Home.js.

---

## 2) 15-Second Skim Assessment

Answer strictly based on what is visible on first load.

**What a knowledgeable research interviewer learns in ~15 seconds:**
1. The author is named "Bart Bai" and is a PhD student in theoretical physics at Weizmann.
2. The site concerns "Quantitative Research → Execution" with emphasis on time semantics and reproducibility.
3. There is something called "SoionLab" and a "Projects" section to explore.

**Primary confusions or missing signals:**
- What is "SoionLab"? No definition or context provided on the homepage.
- Is this a research portfolio or a trading systems portfolio? The phrase "Quantitative Research → Execution" and "live trading" in the About section create ambiguity.
- Where are publications, papers, or research artifacts? A research identity typically signals these.

---

## 3) Role-Specific Audit

### A) Web Designer (fill only if you are Designer)

*(Left empty per role assignment)*

### B) Copywriter (fill only if you are Copywriter)

- **Identity clarity (researcher vs dev/trader):**
  The About section opens with "PhD student in theoretical physics" (researcher identity) but immediately pivots to "I build systems" (builder/engineer identity). The hero title "Quantitative Research → Execution" further blurs this: "Quantitative Research" suggests researcher, but "→ Execution" suggests practitioner or trading operator. The 15-second skim could plausibly conclude either "researcher studying execution" or "person running trading systems."

- **Research framing quality:**
  The Identity Contract (A.3) states the site documents "a personal research lab and research engine." Neither term appears in the homepage copy. The word "research" appears only in the hero title, not in the About section. The framing leans toward *building* rather than *researching*.

- **Over-selling / under-selling risks:**
  - Under-selling: The physics PhD credential is mentioned but not leveraged—no link to publications, no domain specificity (e.g., "field-theoretic models," "time-dependent processes" per Contract A.1).
  - Over-selling: The phrase "live trading" in "backtest, mock, and live trading share one runtime semantics" implies operational capability without qualification. This risks overstating maturity per Contract B.7.

- **Ambiguous or misleading phrases (quote exact text):**
  1. `"Quantitative Research → Execution"` — The arrow implies a pipeline or process. A skeptical reader may interpret this as "quant research that I execute in markets" rather than "research about execution semantics."
  2. `"live trading"` — Directly implies operational trading. Per Contract B.5, the site must not claim "operational trading scale."
  3. `"execution-valid"` — Jargon without definition. Could be read as marketing speak.
  4. `"Explore SoionLab"` — CTA to an undefined entity. Could be interpreted as a product (violates B.2).

- **Tone issues (too casual / too marketing / too vague):**
  - The hero subtitle ("Explicit time semantics. Execution modeling. Reproducibility.") reads as a tagline—compressed, punchy, marketing-adjacent.
  - The About section is more grounded but shifts abruptly from academic credential to system-building claim without transition.

### C) Red Team (fill only if you are Red Team)

*(Left empty per role assignment)*

---

## 4) Evidence-Based Issues

| ID | Section | Observation (objective, quoted) | Why it matters |
|---:|---|---|---|
| 1 | About | `"backtest, mock, and live trading share one runtime semantics"` | The phrase "live trading" implies operational trading capability. Contract B.5 prohibits claiming "operational trading scale." This is the highest-risk phrase on the page. |
| 2 | Hero | `"Quantitative Research → Execution"` | Ambiguous: could mean "research about execution" or "research I execute in markets." Contract C requires a reader to conclude "research identity" within 15 seconds. |
| 3 | About | `"I build systems"` | Builder/engineer framing without qualifier. Contract B.3 prohibits positioning as "full-stack engineer." The absence of research-specific language ("I study," "I investigate," "My research") in this paragraph shifts identity away from researcher. |
| 4 | Hero CTA | `"Explore SoionLab"` | SoionLab is undefined on the homepage. An opaque proper noun with a CTA resembles a product launch. Contract B.2 prohibits "commercial product, startup landing page" framing. |
| 5 | About | No mention of "research engine" or "research lab" | Contract A.3 explicitly describes the site as "a personal research lab and research engine." These terms do not appear anywhere in the homepage copy. |

---

## 5) Risk Flags (if any)

| Flag | Present? | Evidence |
|---|---|---|
| Performance / return implication | No | — |
| Alpha / edge framing | No | — |
| Product / startup positioning | **Possible** | "Explore SoionLab" CTA without definition could read as product launch. |
| "Full-stack engineer" identity leakage | **Possible** | "I build systems" without research qualifier leans toward engineer identity. |
| Operational trading claim | **Yes** | `"live trading"` in About section directly implies operational capability. |

**Summary:** One clear risk flag (operational trading claim via "live trading"). Two possible flags (product positioning, engineer identity leakage).

---

## 6) High-Level Improvement Ideas (No Edits)

- The phrase "live trading" requires qualification or removal to avoid implying operational scale.
- The hero title's ambiguity ("→ Execution") could be clarified with context that grounds it in research.
- The About section could benefit from research-specific verb framing (study, investigate, design) rather than builder framing (build, systems).
- SoionLab needs a one-line definition on the homepage to prevent product/startup inference.
- The physics PhD credential could be connected more explicitly to the research domain per Contract A.1.

Constraints reminder:
- No new sections
- No performance claims
- Micro-level only (copy clarity, spacing, hierarchy)

---

## 7) Summary Verdict

- **Biggest strength to preserve:** The explicit mention of "PhD student in theoretical physics at the Weizmann Institute of Science" anchors a credible research identity.

- **Biggest confusion to fix:** The phrase "live trading" in the About section directly implies operational trading capability, which violates Contract B.5 and is the most likely trigger for a skeptical reader to misclassify the site.

- **Biggest risk to avoid:** A reader concluding this is a trading systems portfolio rather than a research homepage. The combination of "Quantitative Research → Execution," "I build systems," and "live trading" creates a cumulative drift toward practitioner/operator identity.

**Overall assessment (1–2 sentences, restrained tone):**
The homepage successfully establishes the author's academic credential but undercuts research framing with builder language and an unqualified reference to "live trading." Micro-level copy adjustments—particularly around the "live trading" phrase and the undefined "SoionLab" CTA—would bring the page into closer alignment with the Identity Contract.
