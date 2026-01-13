# Homepage Audit

## Repo path + stack
- Repo: /Users/zhaoyub/Documents/GitHub/GitHubpage/zbaiy.github.io
- Stack: Create React App (React 19) with a static build to docs/ (BUILD_PATH=./docs react-scripts build in package.json)
- Entry: public/index.html provides the root template and Google Fonts; React renders into #root via src/index.js.

## Homepage entrypoints + render pipeline
- Template: public/index.html (fonts via Google Fonts; <div id="root"></div>)
- JS root: src/index.js renders <App /> into #root
- App shell: src/App.js composes Header, Home, and Footer
- Homepage content: src/components/Home.js
- Styles: src/App.css (primary), src/index.css (CRA defaults, mostly superseded by App.css)

## Section map (ordered)

1) Header (site identity + navigation)
- Purpose: Persistent top navigation and name identity.
- Visible text: "BART BAI", "Home", "SoionLab", "Projects"
- Defined in: src/components/Header.js (around lines 5-28)
- Styles: .app-header, .logo-text, .app-header nav button in src/App.css (around lines 41-86)

2) Hero
- Purpose: Sets the research/execution theme and provides navigation CTAs.
- Visible text: "Quantitative Research -> Execution"; "Explicit time semantics. Execution modeling. Reproducibility."; "Explore SoionLab"; "View Projects"
- Defined in: src/components/Home.js (around lines 6-21)
- Styles: .hero-section, .hero-title, .hero-subtitle, .hero-actions, .btn-primary, .btn-secondary, .text-accent in src/App.css (around lines 105-163)

3) About
- Purpose: Brief bio and research framing.
- Visible text: "About Me"; "I am a PhD student in theoretical physics at the Weizmann Institute of Science."; "I build systems where backtest, mock, and live trading share one runtime semantics -- time is owned by the Driver and never inferred by the model."
- Defined in: src/components/Home.js (around lines 24-36)
- Styles: .about-card, .about-card h2 in src/App.css (around lines 165-176)

4) Footer (links + contact)
- Purpose: Social links, email, copyright.
- Visible text: "GitHub", "LinkedIn", "zbaiy.imsoion@yahoo.com", "(c) [year] Bart Bai. All rights reserved."
- Defined in: src/components/Footer.js (around lines 5-19)
- Styles: .app-footer, .social-links, .social-links a, .copyright in src/App.css (around lines 443-467)

## Visual hierarchy + density + responsiveness (evidence-based issues)

1) Hero CTA row can overflow on narrow screens
- Cause: .hero-actions is display: flex with no wrap or mobile override.
- Symptom: Two buttons may overflow or squeeze on small widths.
- Source: .hero-actions in src/App.css (around line 132); buttons in src/components/Home.js (around lines 14-20)

2) Header nav likely compresses/overflows on mobile
- Cause: .app-header nav uses a horizontal flex layout with fixed gap and no responsive rule.
- Symptom: Nav items can wrap/overflow on smaller screens; no mobile menu.
- Source: .app-header nav, .app-header nav button in src/App.css (around lines 62-78); header structure in src/components/Header.js (around lines 9-28)

3) Hero title minimum size is large for small screens
- Cause: .hero-title uses clamp(3rem, 6vw, 4.5rem) with a 3rem minimum.
- Symptom: Title likely dominates the viewport on small devices, pushing content below the fold.
- Source: .hero-title in src/App.css (around lines 110-116)

4) Overall spacing feels heavy on small screens
- Cause: .App-content padding 4rem 1.5rem plus .home-container gap 5rem.
- Symptom: Large vertical gaps reduce above-the-fold density on phones.
- Source: .App-content and .home-container in src/App.css (around lines 89-103)

5) No mobile-specific adjustments for Home
- Cause: The only responsive block targets SoionLab components.
- Symptom: Hero/About typography and spacing are unchanged on small screens.
- Source: @media (max-width: 768px) in src/App.css (around lines 479-495)

## 15-second skim assessment
From the hero and about copy, a buy-side/systematic/research interviewer learns this is a "Quantitative Research -> Execution" focused site by Bart Bai, a PhD student in theoretical physics at the Weizmann Institute of Science, emphasizing explicit time semantics and execution-valid research. They also see claims about runtime semantics connecting backtest, mock, and live trading, and a navigation CTA toward "SoionLab" and "Projects." The page presents a research-engine framing but does not quickly define the specific domain scope, artifacts (papers/code), or deliverables.

## Top 3 confusions or missing signals
1) No explicit one-line definition of SoionLab/QuantEngine on the homepage beyond a button label (src/components/Home.js around lines 14-20).
2) The hero does not explicitly state the role/domain in plain language beyond "Quantitative Research -> Execution" (src/components/Home.js around lines 7-13).
3) No visible link to publications/CV/talks in the primary navigation (src/components/Header.js around lines 9-28).

## Candidate patch ideas (ideas only; no structure change)
- Copy: Make the hero subtitle more concrete by naming the research engine and scope (one sentence, same location as current subtitle).
- Copy: Add a short clarifier sentence in the About card that connects "execution-valid" to reproducible research artifacts.
- Typography: Reduce hero title minimum size slightly for mobile readability (same selector; no structural changes).
- Spacing: Tighten .App-content and .home-container vertical spacing for small screens only.
