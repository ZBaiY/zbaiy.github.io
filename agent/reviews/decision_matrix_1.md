# Homepage Decision Matrix

Purpose: consolidate feedback from three specialized reviewers (Web Designer, Copywriter, Red Team) and record the final decision.  
Scope: **homepage only**. **No structural changes** (section order and existence are fixed).

Legend (final decision)
- **KEEP**: keep as-is (maybe tiny phrasing polish later)
- **TUNE**: keep but revise (copy / spacing / typography micro-tweaks only)
- **CUT**: remove or de-emphasize within existing structure (e.g., shorten copy), without introducing new sections

Reviewer roles
- **Web Designer (A)**: visual hierarchy, density, typography, spacing, responsiveness. No copy rewrites.
- **Copywriter (B)**: identity clarity, research framing, wording. No layout/CSS advice.
- **Red Team (C)**: adversarial risks/misinterpretation. No solutions.

---

## 0) Page Snapshot

- Repo / site: zbaiy.github.io
- Stack (Jekyll/Next/plain/etc): static site (GitHub Pages)
- Homepage entrypoint(s): /
- Commit / hash reviewed: TBD
- Date reviewed: 2026-01-13

---

## 1) 15-second Skim Contract

Write the 3 sentences a skeptical research interviewer should learn in 15 seconds **from the current page**:

1. This is the personal research homepage of a PhD researcher in theoretical physics.
2. The focus is on execution-aware quantitative research systems, not on results or products.
3. The page is an invitation to technical research-level discussion and collaboration.

If the current page fails this, record the failure mode:
- Presence of language that suggests operational or live trading risks reclassifying the page as a trading or product pitch.

---

## 2) Issue Matrix

| ID | Section | Observation (objective) | Impact (why it matters) | A (Designer) | B (Copy) | C (Red) | Decision (KEEP/TUNE/CUT) | Change spec (tight) |
|---:|---|---|---|---|---|---|---|---|
| 1 | About | Phrase includes “live trading” | Strongly implies operational trading; violates Identity Contract (B.5) | — | ❗ High risk | ❗ Critical | **CUT** | Remove the phrase “live trading” entirely |
| 2 | Hero title | “Research → Execution” phrasing is ambiguous | Can be read as market execution rather than execution semantics | △ | ⚠️ Ambiguous | ⚠️ Likely misread | **TUNE** | Clarify execution as research/semantics, not market operation |
| 3 | About | Repeated “I build systems” framing | Shifts identity toward builder/product role | — | ⚠️ Drift | △ | **TUNE** | Reframe to study/design/investigate systems |
| 4 | Hero CTA | “Explore SoionLab” without definition | Product/startup landing inference | △ | ⚠️ Undefined | ⚠️ Product signal | **TUNE** | De-emphasize CTA weight or add minimal context |
| 5 | Hero subtitle | Condensed, tagline-like phrasing | Marketing tone weakens research framing | △ | ⚠️ Tone risk | — | **TUNE** | Reduce to neutral research descriptors |

Notes:
- **Observation** must be concrete (quote text / cite CSS selector / cite breakpoint symptom).
- **Impact** must map to: identity clarity, research credibility, skim readability, or risk.
- **Change spec** must be actionable and minimal (e.g., “shorten hero subline to one sentence”).
- 2&3's narrative should be closer to the new identity in the hompage_identity_contract.md

---

## 3) Scoring (before changes)

- Research identity clarity: 7/10 — clear overall, but pulled by trading-adjacent language
- Credibility for research-oriented industry roles: 8/10 — strong if misread risks are removed
- 15-second skim readability: 6.5/10 — hero ambiguity slows classification
- Visual hierarchy / whitespace: 7/10 — generally clean, minor density issues
- Risk of misinterpretation (alpha/dev/startup framing): 6/10 — concentrated in a few phrases

---

## 5) Final Patch Checklist (after changes)

- [ ] Section order unchanged
- [ ] No performance language
- [ ] First screen passes 15-second skim contract
- [ ] Desktop wide (≥1200px) not dense
- [ ] Desktop narrow (~900px) readable
- [ ] Mobile (~390px) readable
- [ ] No broken links / missing assets

---

## 6) Commit Message (reserved)

Proposed commit subject:
- Tighten research identity; remove trading-adjacent ambiguity

Files changed:
- TBD
