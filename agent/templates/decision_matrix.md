

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

- Repo / site: 
- Stack (Jekyll/Next/plain/etc): 
- Homepage entrypoint(s): 
- Commit / hash reviewed: 
- Date reviewed: 

---

## 1) 15-second Skim Contract

Write the 3 sentences a skeptical research interviewer should learn in 15 seconds **from the current page**:

1. 
2. 
3. 

If the current page fails this, record the failure mode:
- 

---

## 2) Issue Matrix

Use one row per issue. Prefer fewer, higher-leverage issues.

| ID | Section | Observation (objective) | Impact (why it matters) | A (Designer) | B (Copy) | C (Red) | Decision (KEEP/TUNE/CUT) | Change spec (tight) |
|---:|---|---|---|---|---|---|---|---|
| 1 |  |  |  |  |  |  |  |  |
| 2 |  |  |  |  |  |  |  |  |
| 3 |  |  |  |  |  |  |  |  |

Notes:
- **Observation** must be concrete (quote text / cite CSS selector / cite breakpoint symptom).
- **Impact** must map to: identity clarity, research credibility, skim readability, or risk.
- **Change spec** must be actionable and minimal (e.g., “shorten hero subline to one sentence”; “increase section gap from X to Y”; “remove performance-suggestive phrase”).

---

## 3) Scoring (before changes)

Score each 0–10 with one-line justification.

- Research identity clarity: 
- Credibility for research-oriented industry roles: 
- 15-second skim readability: 
- Visual hierarchy / whitespace: 
- Risk of misinterpretation (alpha/dev/startup framing): 

---

## 4) Change Budget

Hard constraints for the patch phase:
- No new sections
- No reordering sections
- No performance claims (returns, PnL, “alpha”, “edge”)
- Micro-changes only: copy edits + typography/spacing responsive tweaks
- No new dependencies

Budget:
- Max files touched: 
- Max CSS rule additions: 
- Max copy changes: 

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
- 

Files changed:
- 