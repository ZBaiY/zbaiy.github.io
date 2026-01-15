# Homepage Review (Red Team) - Full Scope

Audience: **LLM reviewers only** (Red Team)
Mode: **Read-only audit**
Scope: **Homepage + Public Research Surface (SoionLab)**

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
| 1 | Hero | Home.js | High-level identity ("Theory-Informed, Execution-Aware Research"). |
| 2 | About Card | Home.js | Credibility statement (PhD Physics) and research philosophy. |
| 3 | Project Grid | Projects.js | Links to GitHub repos (Option Mini Lab, Deeplearning, Tradebot). |
| 4 | SoionLab Landing | SoionLab.js | Research engine documentation, boundaries, and failure cases. |
| 5 | SoionLab Failure Card | SoionLab.js | Comparative failure analysis (Vectorized vs. Event-Driven). |

---

## 2) 15-Second Skim Assessment

**What a knowledgeable research interviewer learns in ~15 seconds:**
1. **Academic Credibility:** The "PhD researcher" and "Weizmann Institute" signals are front-and-center.
2. **Identity Split:** There is a clear divide between "Physics/Theory" (About) and "Execution/Code" (SoionLab).
3. **Maturity Signal:** The SoionLab subtitle ("cross-domain experiments") and failure card ("Vectorized pipelines typically do...") signal deep familiarity with real-world engineering pain points.

**Primary confusions or missing signals:**
- **The "Legacy" Bot:** The presence of "Tradebot v3 (Legacy)" in the project list is a slight noise signal. Is it relevant research, or just an old hobby script?
- **Research vs. Trading:** The user is explicitly a "Researcher," but the projects (Options, Tradebot) are finance-heavy. The "Quant" label is implied but not claimed.

---

## 3) Role-Specific Audit

### C) Red Team

- **Most likely misinterpretation by a skeptical reader:** "This is a **Physics PhD** looking to pivot into Quant. They are smart and have built some impressive infrastructure (SoionLab), but their actual financial domain knowledge might be limited to 'textbook options' (Option Mini Lab) and 'hobby bots' (Tradebot)."
- **Strongest negative inference:** The candidate risks being seen as **"Too Theoretical"** for a trading desk (due to the Physics emphasis) and **"Too Junior"** for a Senior Quant role (due to the presence of "mini labs" and "bots").
- **Phrases or sections that could trigger doubt:**
    - "Tradebot v3 (Legacy)... automating data collection... via Binance API." -> *Attack: "Binance bots are the 'Hello World' of crypto. Why is this on a 'Research' site? It dilutes the 'Theory-Informed' brand."*
    - "Option Mini Lab... connecting Itô calculus with working Python code." -> *Attack: "This sounds like a student project. A senior researcher shouldn't need to prove they can code Itô calculus. Is this a portfolio or a homework assignment?"*
- **Questions an interviewer would challenge verbally:**
    - "You have a deep infrastructure engine (SoionLab) and a deep theory background (Physics). But your financial projects look surprisingly basic (Mini Lab, Tradebot). Where is the 'middle layer' of complex financial modeling?"
    - "Is SoionLab actually used for the 'Deeplearning' project, or are these three separate islands of work?"

---

## 4) Evidence-Based Issues

| ID | Section | Observation (objective, quoted) | Why it matters |
|---:|---|---|---|
| 1 | Projects | "Tradebot v3 (Legacy)..." | Including a "Legacy" crypto bot lowers the signal-to-noise ratio. It contradicts the "Research-Grade" framing of SoionLab. |
| 2 | Projects | "Option Mini Lab... Itô calculus" | The title "Mini Lab" frames it as a toy. For a PhD, "Stochastic Calculus Implementation" would be a stronger frame if it's rigorous. |
| 3 | SoionLab Note | "Strategy results... studied at a different layer..." | **Strong Defense.** This line effectively walls off the "Where is the alpha?" attack for SoionLab. |
| 4 | SoionLab Failure Card | "Vectorized pipelines typically do..." | **Strong Offense.** This explicitly attacks the standard toolchain, positioning the author as an expert critic. |

---

## 5) Risk Flags (if any)

- **Portfolio Inconsistency:** The high-status "Physics PhD" + "SoionLab Architecture" is dragged down by the low-status "Tradebot" and "Mini Lab" titles. It looks like a senior engineer showing junior projects.
- **Identity Leakage:** The "About Me" says "theoretical physics," but the projects are 100% software/finance. The bridge between "Field Theory" and "Option Pricing" is implied but not demonstrated.

---

## 6) High-Level Improvement Ideas (No Edits)

- **Rename/Reframe Projects:** Change "Option Mini Lab" to something more descriptive like "Computational Finance Primitives." Consider dropping "Tradebot v3" or explicitly labeling it as "Infrastructure Study" to align with SoionLab.
- **Connect the Dots:** Explicitly state *why* a Physicist built SoionLab. (e.g., "Studying market microstructure requires the same event-time rigor as particle collision data").

---

## 7) Summary Verdict

- **Biggest strength to preserve:** The **SoionLab "Research Stack" framing**. It is the most professional and defensible part of the site.
- **Biggest confusion to fix:** The **Project Titles**. They feel like "student work" compared to the "staff engineer" quality of the SoionLab docs.
- **Biggest risk to avoid:** Being bucketed as "Smart Physics Grad who dabbles in crypto" rather than "Serious Quant Researcher."

Overall assessment: **Strong Infrastructure, Weak Applications.** The "Engine" (SoionLab) looks senior; the "Cars" (Projects) look junior. The candidate needs to elevate the framing of the projects to match the sophistication of the engine.
