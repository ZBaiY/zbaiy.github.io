# Homepage Review (Red Team) - v8

Audience: **LLM reviewers only** (Red Team)
Mode: **Read-only audit**
Scope: **Homepage + Projects + SoionLab**

---

## 0) Review Metadata

- Reviewer role: Red Team
- Model: Gemini 2.0 Flash
- Date: Wednesday, January 14, 2026
- Repo / site: zbaiy.github.io
- Entrypoint(s): `src/components/Home.js`, `src/components/Projects.js`, `src/components/SoionLab.js`

---

## 1) Section Map (As-Is)

| Order | Section name | Content ID | One-line purpose |
|---:|---|---|---|
| 1 | Hero | Home.js | "Theory-Informed, Execution-Aware Research." |
| 2 | About Card | Home.js | PhD Physics identity + Research philosophy. |
| 3 | Projects Grid | Projects.js | **UPDATED:** Two items: "Stochastic Calculus" + "WIS Deeplearning". |
| 4 | SoionLab Landing | SoionLab.js | Research Engine documentation. |
| 5 | Status Note | SoionLab.js | **UPDATED:** "Research Stack" framing. |

---

## 2) 15-Second Skim Assessment

**What a knowledgeable research interviewer learns in ~15 seconds:**
1. **High Signal-to-Noise:** The "TradeBot" clutter is gone. Every item (Physics, Stochastic Calculus, SoionLab) signals "Research."
2. **Coherence:** The portfolio tells a consistent story: Physics PhD -> Stochastic Math -> Execution Engine.
3. **Maturity:** The "Research Stack" note on SoionLab immediately sets a senior boundary.

**Primary confusions or missing signals:**
- **Visual Sparsity:** The "Other Projects" grid has only two items. On a wide monitor, this looks empty. It raises the question: "Is that it?"
- **The "Legacy" Ghost:** The subtitle "Experiments, tools, and **legacy codebases**" is still there, but there are no legacy codebases visible. This creates a disconnect.

---

## 3) Role-Specific Audit

### C) Red Team

- **Most likely misinterpretation by a skeptical reader:** "This candidate is sharp and has high standards (hence the rigorous SoionLab docs), but they haven't actually built much yet. The portfolio feels 'curated to emptiness.' They deleted the junk but didn't replace it with volume."
- **Strongest negative inference:** The candidate is a **"Quality-Over-Quantity"** perfectionist. This is good for Safety roles, bad for Trading roles where iteration speed matters.
- **Phrases or sections that could trigger doubt:**
    - "legacy codebases" (Subtitle) -> *Attack: "Where? I don't see them. Did you forget to update the text?"*
    - "Experiment for the option chain modules in SoionLab." -> *Skeptic: "Good connection. But why isn't SoionLab itself in this grid? It feels like the main character is missing from the cast list."*

---

## 4) Evidence-Based Issues

| ID | Section | Observation (objective, quoted) | Why it matters |
|---:|---|---|---|
| 1 | Projects | "legacy codebases" (Subtitle) | **Inaccuracy.** There are no legacy codebases listed. It makes the site look slightly unmaintained. |
| 2 | Projects | Grid contains only 2 items. | **Visual Weakness.** It feels like a placeholder section. |
| 3 | SoionLab Note | "Studied at a different layer..." | **Strongest Asset.** This single sentence does more work than the entire previous version of the page. |

---

## 5) Risk Flags (if any)

- **The "Academic" Trap:** With "TradeBot" gone, the portfolio is now 100% academic/theoretical (Physics + Stochastic Calc + Research Engine). There is zero "hustle" signal left. This filters *out* prop shops that want scrappy traders, and filters *in* research labs that want rigorous thinkers. (This is likely intended, but it is a risk).

---

## 6) High-Level Improvement Ideas (No Edits)

- **Fix the Subtitle:** Change "legacy codebases" to "Selected Implementations."
- **Add SoionLab to Grid:** As discussed, adding SoionLab as a 3rd card would balance the grid and reinforce the "Flagship" status.

---

## 7) Summary Verdict

- **Biggest strength to preserve:** The **Consistency**. There are no more jarring "Crypto Bot" moments. The tone is uniform and professional.
- **Biggest confusion to fix:** The **Empty Grid**. It needs visual weight.
- **Biggest risk to avoid:** Looking "Low Output." The quality is high, but the volume is low.

Overall assessment: **Professional Research Portfolio.** The "Red Team" has stopped laughing at the Crypto Bot and started respecting the Research Engine. The remaining issues are purely cosmetic/structural (grid layout), not reputational.
