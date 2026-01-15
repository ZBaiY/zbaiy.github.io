# Research Scope Contract

This document defines the **scope, boundaries, and intent** of this personal research site.

It is written to make explicit **what this site is responsible for, and what it is not**.

The goal is not completeness, but **correct framing**.

---

## 1. Purpose of This Site

This site documents my work as a **theoretical and quantitative researcher**, with emphasis on:

- structure
- time
- execution semantics
- inspectability of complex systems

It serves as a **research-facing interface**, not a product showcase.

---

## 2. Position in the Research Stack

The materials on this site are organized according to a layered research stack:

```
Conceptual Models
↓
Formal Structure & Semantics
↓
Execution Substrate & Instrumentation
↓
Strategies / Models
↓
Results, Performance, and Empirical Claims
```
This site primarily covers the **middle layers**:
- formal structure,
- execution semantics,
- inspection surfaces,
- and their failure modes.

Empirical performance, alpha claims, and production-scale optimization are **downstream layers** and are treated separately.

---

## 3. What This Site Explicitly Covers

### 3.1 Structural Reasoning

- How time is modeled and advanced.
- How data visibility is defined.
- How boundaries between subsystems are enforced.
- How failures are surfaced rather than hidden.

### 3.2 Inspectable Artifacts

- Logs, traces, and schemas designed for post-hoc inspection.
- Explicit recording of missing, delayed, or degraded inputs.
- Reconstructability of execution context.

### 3.3 Research-Grade Prototypes

- Systems and code intended to explore **correctness, semantics, and constraints**.
- Not optimized for throughput or latency unless explicitly stated.
- Written to be read, audited, and reasoned about.

---

## 4. What This Site Does Not Claim

This site **does not claim**:

- That strategy performance implies correctness of the engine.
- That correctness of the engine implies profitable strategies.
- That absence of results indicates absence of rigor.
- That research is complete or closed.

Performance, alpha, and production execution are **studied at a different layer** of the research stack.

---

## 5. Non-Goals (By Design)

The following are intentionally **out of scope** here:

- Live trading systems
- Latency benchmarks
- Market microstructure completeness
- Exchange-specific edge cases unless explicitly studied
- Claims of optimality or profitability

Their absence should not be read as omission, but as **layer separation**.

---

## 6. Iterative and Incomplete by Construction

Research systems documented here may be:

- partial,
- evolving,
- or intentionally simplified.

This is a consequence of studying **foundational layers first**.

Iteration is expected.
Boundaries may shift.
Contracts may tighten.

---

## 7. Intended Audience

This site is written for:

- researchers,
- system architects,
- and technically literate reviewers.

It assumes familiarity with:
- asynchronous systems,
- layered architectures,
- and the distinction between correctness and performance.

It is not optimized for casual consumption.

---

## 8. Reading Guidance

If you are looking for:
- **results** → this site provides context, not conclusions.
- **performance** → this site provides substrates, not benchmarks.
- **structure** → this site is the correct entry point.

---

## 9. Closing Statement

This site should be read as a **research notebook with contracts**, not a finished product.

Its value lies in **making assumptions explicit**, not in hiding complexity.

That explicitness is the work.