# SoionLab Decision Matrix v1

Purpose  
Consolidate feedback from Web Designer and Red Team for the **SoionLab page**,  
and record final, human-approved decisions.

Scope  
- Page: **SoionLab (documentation / inspection surface)**
- This matrix governs **layout, structure, and visual semantics** only.
- Documentation content (agent/docs/*.md) is **out of scope** here.

Legend (final decision)
- **KEEP**: acceptable as-is
- **TUNE**: revise via layout / visual / labeling micro-changes
- **CUT**: remove from SoionLab landing (may still exist in deep docs)

Reviewer roles
- **Web Designer (A)**: layout, hierarchy, interaction affordances, reading flow
- **Red Team (C)**: adversarial interpretation risks (vaporware, infra-as-research, tutorial drift)

---

## 0) Page Snapshot

- Repo / site: zbaiy.github.io
- Target page: SoionLab
- Stack: React (static build)
- Commit / hash reviewed: [HOLDER: commit]
- Date reviewed: 2026-01-14

---

## 1) 15-Second Inspection Contract

After ~15 seconds on the SoionLab page, a skeptical research reader should conclude:

1. This page describes a **research inspection surface**, not a product or tutorial.
2. The system enforces concrete constraints around **time, data visibility, and execution context**.
3. What is shown is **inspectable structure**, not results or performance claims.

Failure mode if violated:
- Reads like README / tutorial / unfinished framework.

---

## 2) Issue Matrix

| ID | Area | Observation (objective) | Impact | A (Designer) | C (Red) | Decision | Change spec (tight) |
|---:|---|---|---|---|---|---|---|
| 1 | Installation section | Visual language resembles “getting started” tutorial | Induces tutorial mental model | WARN | LOW | **TUNE** | Rename / visually de-emphasize; move to deep docs area |
| 2 | Placeholders | Multiple placeholders visible on landing | Feels unfinished / vaporware | WARN | MOD | **TUNE / CUT** | Keep ≤2 anchors on landing; move others to deep docs |
| 3 | Navigation | Sidebar-first doc navigation encourages exploration | Product-like exploration bias | WARN | LOW | **TUNE** | Default single doc open; plain list styling |
| 4 | Overview density | Long prose blocks resemble paper intro | Abstraction fatigue | OK | WARN | **TUNE** | Aggressive copy reduction; bullets over paragraphs |
| 5 | Case study block | Placeholder reads as promise | Implied results risk | OK | MOD | **CUT** | Remove from landing; reintroduce later if concrete |

Notes:
- Observations must cite **specific UI elements**, not intent.
- Changes must be **layout / structure only** (no new narrative).

---

## 3) Risk Summary (Red Team)

- Trading / alpha misread: **Low**
- Product / startup framing: **Low**
- Tutorial / README drift: **Moderate**
- Infra-as-research perception: **Moderate**

Overall risk posture: **Acceptable after TUNE items**

---

## 4) Change Budget

Hard constraints for this patch phase:
- No new narrative sections
- No documentation content rewrite
- No performance or results language
- No new dependencies

Budget:
- Max files touched: 2–3 (SoionLab page JS/CSS)
- Max new layout blocks: ≤2
- Placeholder count on landing: ≤2

---

## 5) Final Acceptance Checklist

- [ ] Page reads as inspection surface, not tutorial
- [ ] No placeholder dominates visual hierarchy
- [ ] Reading-first flow preserved (minimal clicking)
- [ ] Mobile and desktop convey same mental model
- [ ] No implied results, performance, or readiness

---

## 6) Commit Message (reserved)

Proposed subject:
- `soionlab: tighten inspection layout and reduce tutorial affordances`

Files changed:
- [HOLDER: paths]