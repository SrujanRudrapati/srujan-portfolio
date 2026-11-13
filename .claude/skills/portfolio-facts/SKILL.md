---
name: portfolio-facts
description: The only approved facts for Srujan Rudrapati's portfolio site. Load whenever editing any text, data file, metric, date, link, or email on the portfolio site, including projects.ts, graph.ts, portfolio.ts, experience data, hero chips, contact, JSON-LD, meta tags, or any copy a visitor can read. Also load when writing content dumps, diffs, or the Ask panel's suggested questions.
---

# Portfolio facts (single source of truth)

Rule 5 of `docs/REDESIGN_RUNBOOK.md`, verbatim:

> **Facts.** Use only facts in this file and facts already on the site. Never invent numbers, dates, metrics, titles, or claims. Approximate numbers keep their marker (`~`, `about`). Empty is better than invented.

"Facts already on the site" means the strings in `src/content/portfolio.ts` as of commit `491260e` (and later, `src/data/projects.ts` and `src/data/graph.ts` once they derive from it). Where this file and the site disagree, this file wins; the site is updated in Phase 5.

Owner: Srujan Rudrapati. Contact email everywhere: rudrapati.srujan@gmail.com.
Live site: https://srujanrudrapati.github.io/srujan-portfolio/

---

## 2. Facts (single source of truth for content)

### 2.1 Surplus AI / Surplus Station — featured, status: production
- ASU Surplus, Tech Assistant, started June 2026. In production. Remove any "in progress" / "files still copying" wording site-wide.
- Processing time per item: about 15 min → about 3 min (~80% less).
- Bulk auction listings automated: a 100+ unit pallet now takes ~10 min instead of 1–2 hours.
- Runs offline: Qwen 14B across four Mac minis plus Llama 3B on one, via MLX.
- Handles identification, condition grading, pricing, label printing, database export.
- Merge rules keyed on serial number so a low-quality read never overwrites good data.
- Traced repeated cluster failures to macOS permissions and network routing.

### 2.2 DevHacks × Cubbie hackathon — featured, status: hackathon
- 1st place, Track 1, Oct 2026, among 82 submissions from 350+ students. How the winner was chosen is not a fact here: never say it was a vote or describe the judging. Where a sublabel needs words after "1st", use "Track 1, DevHacks × Cubbie".
- **Cooked** (winner): reads Canvas deadlines and grade weights, scores the week 0–100 with plain math, books study blocks on Google Calendar after the student says yes. Repo: https://github.com/SrujanRudrapati/cooked
- **Receipts**: Discord bot that catches promises in chat; 493 automated tests in CI. Repo: https://github.com/SrujanRudrapati/receipts
- **Bailout**: roommates' AI agents trade chores via an auction with human approval at each step. No repo link.

### 2.3 Label Lens — featured, status: live
- Live: https://label-lens-iota.vercel.app
- Reads food/medicine labels from a photo and checks them against the user's allergies and medications.
- Every AI warning must quote the label word for word (44/44 verified).
- 56 unit + 6 end-to-end tests.
- Running a fast and a deep model in parallel cut response time from 16 s to 4–9 s.
- Stack: Next.js, TypeScript, Claude API, zod, Vitest, Playwright.

### 2.4 Celebal Technologies — experience
- Associate, Data Engineering, Sep 2022 – Nov 2024; intern Jul – Aug 2022.
- Industries: add e-commerce to whatever is listed.
- Add: Kafka and Spark pipelines on Databricks for a major fashion e-commerce client, modeling impressions, clicks, conversions, spend, and attribution, with Power BI dashboards.
- Add: on call for the 10M-records/day AWS pipeline.
- Add: tuned Spark jobs and SQL on Databricks for performance and cost.
- Add: reviewed teammates' code as senior data engineer on one project.
- Add: mentored two interns.
- Keep all existing Celebal bullets that remain accurate.

### 2.5 Hand Gesture Controlled RC Car — other project, status: academic
- B.Tech major project, team of three.
- Arduino C++, ADXL335 accelerometer, RF modules with HT12E/HT12D encoder/decoder, L298 motor driver, IR obstacle detection; tested in Gazebo simulation.

### 2.6 Contact
- Email: rudrapati.srujan@gmail.com — replace every other address (contact, footer, mailto, JSON-LD, meta).
- Resume: link to `/resume.pdf` in `public/`. If the current PDF has another name, rename the link target and note it in STATUS; Srujan will drop in the latest file.

### 2.7 Keep unchanged
Supply Chain Watchtower, capstone, CI/CD project, WLAN toolkit, F1 predictor, Kubernetes project, Java chat app, skills, certifications, education.

Featured order: Surplus AI, DevHacks × Cubbie, Label Lens, Supply Chain Watchtower.

---

## 3. v5 additions and overrides (DECISIONS 26, 2026-11-13; these win over Section 2)

### 3.1 Names, places, availability
- Surplus AI is now **Surplus Station** (same project, same facts as 2.1). Page `/work/surplus-station`; `/work/surplus-ai` redirects.
- Processing time wording: "~80% less time per item" (never "80% faster").
- The WLAN Traffic Forensics Toolkit is now **Network Anomaly Toolkit** (résumé). It flags anomalies in 100,000+ network packets and caught a live denial-of-service attack.
- Personal location: "Phoenix, AZ". The M.S. campus stays "Tempe, AZ".
- Availability: "Available January 2027. Open to relocating anywhere in the US, or remote."
- Surplus Station hardware and tools stay as in 2.1 (Bash USB script that reads Macs; Qwen 14B on four Mac minis plus Llama 3B on a fifth). Do not write "PowerShell" or "Windows" for it.

### 3.2 InvoiceGuard (featured, status: live demo)
- AI extracts invoice fields, proves every value against the original page, checks the math, and sends only doubtful invoices to a person, whose corrections become test cases.
- 6 of 6 bad invoices caught; 15 of 16 good ones auto-approved; about $0.0005 per invoice; a model costing 20 times more changed no decisions; 113 tests.
- Stack: Python, Claude API, LLM evaluation.
- Live demo: https://invoiceguard-srujan.onrender.com . Repository: not supplied yet (show a placeholder). Walkthrough video: not supplied yet (placeholder).

### 3.3 RecordSync (featured, status: personal)
- A pipeline that validates, normalizes, and matches customer records from two systems into one golden record each, tracks where every field came from, and sends unclear matches to a person.
- 80 tests; same results on every re-run. Stack: Python, pydantic, SQLite, pytest. Repository: not supplied yet (placeholder).

### 3.4 Margin Radar (other project, status: prototype)
- Résumé wording: an agent that flags a business's margin problems early, where every number in its briefs traces back to a SQL query; tested on held-out data, with documentation of where it still fails. Python, DuckDB, Claude API. October 2026.

### 3.5 HeatShift (other project, status: hackathon)
- A heat-safety planner built in about 75 minutes at IBM's Bobathon.

### 3.6 Certifications
- Five: the four in the graph plus Microsoft Certified: Fabric Analytics Engineer Associate.

Featured order (v5): Surplus Station, InvoiceGuard, Label Lens, RecordSync, DevHacks × Cubbie, then Celebal Technologies (experience, shown with the projects).

---


---

## Self-check before saving any edit

List every number, date, name, title, link, and claim you are about to write, and beside each one write its source: the Section 2 line above (e.g. "2.3: 56 unit + 6 end-to-end tests") or the exact `portfolio.ts` field it already lives in. Anything with no source does not get written. If a sentence needs a fact you do not have, shorten the sentence or leave the field empty, and if the gap matters, append a numbered question to `docs/REDESIGN_DECISIONS.md` with a recommended default.

Red flags that mean you are inventing: a number not in Section 2 or on the site; a client name that is not already on the site; "led", "managed", "senior" or "architect" in a title (the brief bans inflated titles); "shipped", "deployed", "production" or "users" applied to Supply Chain Watchtower; em or en dashes in copy (banned; use commas or a period); the words leverage, seamless, robust, cutting-edge, passionate, synergy, spearheaded, utilize, delve.
