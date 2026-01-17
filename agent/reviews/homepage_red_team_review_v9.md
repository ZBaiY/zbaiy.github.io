# Homepage Review (Red Team) - v9

Audience: **LLM reviewers only** (Red Team)
Mode: **Read-only audit**
Scope: **Homepage + Projects**

---

## 0) Review Metadata

- Reviewer role: Red Team
- Model: Gemini 2.0 Flash
- Date: Friday, January 16, 2026
- Repo / site: zbaiy.github.io
- Entrypoint(s): `src/components/Home.js`, `src/components/Projects.js`

---

## 1) Section Map (As-Is)

| Order | Section name | Content ID | One-line purpose |
|---:|---|---|---|
| 1 | Header | Header.js | Navigation (Home, SoionLab, Projects, Publications). |
| 2 | Hero | Home.js | Identity ("Theory-Informed, Execution-Aware") + CTAs. |
| 3 | About Card | Home.js | Credibility (PhD Physics, Weizmann) + Research Philosophy. |
| 4 | Projects Grid | Projects.js | Two items: "Stochastic Calculus" + "WIS Deeplearning". |

---

## 2) 15-Second Skim Assessment

**What a knowledgeable research interviewer learns in ~15 seconds:**
1. **Clear Academic Pedigree:** The "PhD researcher in theoretical physics" and "Weizmann Institute" signals are unambiguous and high-status.
2. **Research Focus:** The keywords "Structure, Time, and Constraints" immediately frame the work as foundational/structural rather than PnL-driven.
3. **Artifacts:** There is a "Research Engine" (SoionLab) and "Publications" available for inspection.

**Primary confusions or missing signals:**
- **Project Scarcity:** The "More Projects" button leads to a grid with only two items. This visual sparsity might suggest a lack of breadth or a very early career stage, despite the senior-sounding philosophy.
- **The "CV" Void:** The CV link is present in the code but commented out. Its absence in the rendered header is a missing trust signal for a PhD candidate.

---

## 3) Role-Specific Audit

### C) Red Team

- **Most likely misinterpretation by a skeptical reader:** "This candidate is a 'Purist.' They have built a rigorous engine (SoionLab) and have a strong math background (Stochastic Calc), but they might be too academic for a fast-paced trading floor. They care more about 'Time Semantics' than 'Shipping Features'."
- **Strongest negative inference:** The portfolio is **"Low Volume, High Latency."** The removal of "Tradebot" was correct for quality, but it left a void. The remaining projects are "Homework-adjacent" (Mini Lab, U-Net). The only "Adult" software is SoionLab.
- **Phrases or sections that could trigger doubt:**
    - "Experiment for the option chain modules in SoionLab." (in Projects) -> *Attack: "Why is the experiment separate? Is SoionLab not functional enough to contain it?"*
    - "Structure, Time, and Constraints." (Hero Subtitle) -> *Skeptic: "Abstract. Give me a concrete problem you solved."*
- **Questions an interviewer would challenge verbally:**
    - "You have 'Publications' and a 'Research Engine.' Do you have any code that interacts with a live market, or is this all simulation?"
    - "Your 'Projects' section is quite thin. Is SoionLab the only significant codebase you've authored?"

---

## 4) Evidence-Based Issues

| ID | Section | Observation (objective, quoted) | Why it matters |
|---:|---|---|---|
| 1 | Projects | Grid contains only 2 items. | **Visual Weakness.** On large screens, this looks unfinished. It reinforces the "Academic Theorist" stereotype (lots of thought, little output). |
| 2 | Header | "CV" button is missing (commented out). | **Credibility Gap.** For a PhD researcher, the CV is the primary ledger of value. Hiding it forces the user to judge based on the web copy alone. |
| 3 | Hero | "Theory-Informed, Execution-Aware" | **Strong Positioning.** This successfully bridges the Physics-to-Quant gap. It defends against the "failed physicist" bias by claiming execution awareness. |

---

## 5) Risk Flags (if any)

- **"Ivory Tower" Risk:** **HIGH.** The combination of "Theoretical Physics," "Structure/Time" philosophy, and a rigorous but content-light Project grid creates a picture of someone who loves abstractions but avoids messy realities.
- **"Vaporware" Risk:** **LOW.** SoionLab is detailed enough to prove existence.
- **"Trader" Risk:** **ELIMINATED.** There is zero language left that sounds like a crypto-bro or retail trader.

---

## 6) High-Level Improvement Ideas (No Edits)

- **Uncomment the CV:** If the CV is ready, it is the single highest-ROI addition to this page.
- **Add a "Systems" Project:** If there is any other infrastructure work (e.g., a data pipeline, a cluster manager), add it to the Projects grid to show engineering breadth.
- **Flesh out Project Descriptions:** The "Stochastic Calculus" card could be punchier. Instead of "Connecting Itô calculus...", try "Vectorized Option Pricing Engine."

---

## 7) Summary Verdict

- **Biggest strength to preserve:** The **Identity Coherence**. The site speaks with one voice: "I am a serious researcher building serious tools."
- **Biggest confusion to fix:** The **Project Void**. The site builds up anticipation ("Research Engine", "Execution-Aware") but delivers a very small menu of side projects.
- **Biggest risk to avoid:** Being dismissed as "Too Academic" for practical roles.

Overall assessment: **Clean, Rigorous, but Sparse.** The "Red Team" can no longer attack the quality of the content, so the attack shifts to the *quantity* of the evidence. The site effectively sells the *potential* of the candidate, but the *proof* (Projects) is currently the weakest link.
