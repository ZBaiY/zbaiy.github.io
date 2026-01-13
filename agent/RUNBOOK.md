

# Homepage Agent Review RUNBOOK

This document defines the **exact execution protocol** for running the three-agent homepage review.
The goal is **controlled, comparable judgment**, not creative iteration.

---

## 0. Purpose

- Produce **independent, role-pure audits** of the homepage
- Prevent agent cross-contamination and premature optimization
- Centralize all decision authority in the **Decision Matrix**

This runbook is optimized for:
- Homepage evaluation before collaboration outreach
- PhD summit / research recruiting readiness checks
- Iterative copy/UX tightening without identity drift

---

## 1. Inputs (Fixed)

Each agent run uses the **same inputs**:

- Target: GitHub Pages homepage repo (or deployed URL)
- Files provided to the agent:
  - `agent/role_*.md` (role-specific)
  - `agent/templates/homepage_review_template.md`

Agents must **not** receive:
- Other agents’ outputs
- The decision matrix
- Any instruction to modify code or content

---

## 2. Agent Roles

The three agents and their responsibilities are fixed:

1. **Web Designer**  
   Focus: visual hierarchy, density, typography, responsiveness

2. **Copywriter**  
   Focus: identity clarity, research framing, wording risks

3. **Red Team**  
   Focus: adversarial misinterpretation, credibility risks

Each agent must strictly follow its role specification in `agent/role_*.md`.

---

## 3. Execution Order (Mandatory)

Agents are executed **sequentially**, not in parallel:

1. Web Designer
2. Copywriter
3. Red Team

Rationale:
- Designer establishes structural facts
- Copywriter evaluates language within that structure
- Red Team attacks the combined surface

No agent may be re-run after seeing downstream output.

---

## 4. Output Artifacts

Each agent produces **one Markdown file** using the shared template.

Recommended naming:

- `reviews/homepage_designer_review.md`
- `reviews/homepage_copywriter_review.md`
- `reviews/homepage_redteam_review.md`

All reviews must:
- Use `homepage_review_template.md`
- Contain quoted evidence
- Avoid solutions or edits

---

## 5. Consolidation Step (Human Only)

After all three reviews are complete:

1. Extract issues into `agent/templates/decision_matrix.md`
2. For each issue, record:
   - Objective observation
   - Each agent’s stance
   - Final decision: **KEEP / TUNE / CUT**
3. Define a **minimal change spec** if TUNE/CUT

No agent participates in consolidation.

---

## 6. Change Phase Constraints

If changes are approved:

- No new sections
- No section reordering
- No performance or alpha claims
- Only micro-level copy or spacing/typography tweaks

All changes must pass the **Final Patch Checklist** in the decision matrix.

---

## 7. Re-run Policy

Re-run the full agent sequence only if:
- More than trivial copy was changed, or
- Visual hierarchy was altered, or
- A new identity ambiguity may have been introduced

Never re-run only one agent in isolation after changes.

---

## 8. Termination Condition

This process terminates when:
- The 15-second skim contract is satisfied
- No Red Team blocking risks remain
- Further changes would be stylistic rather than substantive

At that point, **stop iterating**.

---

## 9. Guiding Principle

> This process exists to prevent over-selling.
> Restraint beats cleverness.

The homepage is an invitation to conversation — nothing more.