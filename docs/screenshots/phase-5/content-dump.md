# Phase 5 content dump

Plain-text render of every project and experience entry for proofreading against facts Section 2. Generated 2026-10-30 with `npm run content:dump` from `src/data/projects.ts` and `src/content/portfolio.ts`. Hero and contact strings follow.

```
## Surplus AI
status: production (featured)
date: June 2026 to present
context: Built on the job, in production
one-liner: Private, offline AI system for ASU Surplus
impact: ~80% less processing time per item, about 15 min down to about 3 min
impact: ~10 min to list a 100+ unit pallet, instead of 1 to 2 hours
impact: 14B Qwen model across four Mac minis, offline, via MLX
problem: Surplus staff were typing hardware specs into a spreadsheet by hand, which introduced typos into the inventory. Writing product listings was also manual.
built: One connected pipeline: collect specs, build a master spreadsheet, and have AI write the listings, all on a private network that never touches the internet.
highlight: Handles identification, condition grading, pricing, label printing, and database export.
highlight: Runs offline: Qwen 14B across four Mac minis plus Llama 3B on one, via MLX. Replies stream word by word.
highlight: Merge rules keyed on serial number, so a low-quality read never overwrites good data.
highlight: Traced repeated cluster failures to macOS permissions and network routing.
highlight: A Listings tab builds a strict prompt from each row's real specs, and a Cluster tab polls each node over SSH every 5 seconds.
How it works:
  - Five-node cluster: Five M1 Mac minis on a gigabit switch with no internet uplink, fixed IPs, and passwordless SSH from the head node. Apple's MLX framework splits one model across several machines with tensor parallelism, so a 14B model can run across Macs that can't hold it individually.
  - USB spec collector: A Bash script on a USB stick runs system_profiler on each Mac, reads model, chip, RAM, storage, battery health, and macOS version, looks up year and screen size from a reference table, and de-duplicates by serial number.
  - Camera inventory scanner: For Macs that won't boot, a webcam photographs the bottom label and Apple's Vision OCR reads the model number, EMC, and serial. These are matched against the lookup table to get product, year, screen size, and resale lane (Retail, Auction, or Parts).
  - Merge logic: Both sources land in one master inventory keyed on serial number, so a camera scan never overwrites real data from a working machine.
  - Surplus AI app: A Flask server runs two model engines: Qwen 14B across four nodes, and Llama 3B on one node for quick responses. Replies stream word by word. A Listings tab builds a strict prompt from each row's real specs, and a Cluster tab polls each node over SSH every 5 seconds.
  - Launchers: One double-click starts everything, waits for the engines to respond, and opens the app. Closing it shuts down every node.
status note (running): Qwen 14B on four Mac minis
status note (running): Llama 3B on one
stack: MLX, Flask, Bash, Apple Vision OCR, Qwen 14B, Llama 3B
diagram: surplus-pipeline, surplus-network, surplus-privacy

## DevHacks × Cubbie hackathon
status: hackathon (featured)
date: October 2026
one-liner: Three entries built for the DevHacks × Cubbie hackathon: Cooked, Receipts, and Bailout.
impact: 1st place, Track 1, chosen by public student vote
impact: 82 submissions from 350+ students
impact: 493 automated tests in CI for Receipts
highlight: Cooked (winner): reads Canvas deadlines and grade weights, scores the week 0 to 100 with plain math, and books study blocks on Google Calendar after the student says yes.
highlight: Receipts: a Discord bot that catches promises in chat, with 493 automated tests in CI.
highlight: Bailout: roommates' AI agents trade chores through an auction, with human approval at each step.
stack: 
link repo: https://github.com/SrujanRudrapati/cooked
link: Receipts repository: https://github.com/SrujanRudrapati/receipts

## Label Lens
status: live (featured)
one-liner: Reads food and medicine labels from a photo and checks them against the user's allergies and medications.
impact: 44/44 AI warnings verified to quote the label word for word
impact: 4 to 9 s response time, down from 16 s, with a fast and a deep model in parallel
impact: 56 + 6 unit and end-to-end tests
highlight: Every AI warning must quote the label word for word (44 of 44 verified).
highlight: Running a fast and a deep model in parallel cut response time from 16 s to 4 to 9 s.
stack: Next.js, TypeScript, Claude API, zod, Vitest, Playwright
link live: https://label-lens-iota.vercel.app

## Autonomous Supply Chain Watchtower
status: personal (featured)
date: November 2025
context: Personal project, built solo
one-liner: Multi-agent LLM system
impact: 3 agents in sequence on the Claude API
problem: Turning raw sales history into a logistics plan normally takes several manual steps by different people.
built: Three agents running in sequence on the native Anthropic Claude API through CrewAI, each consuming the previous agent's output. The Risk Analyst has a custom tool backed by a retrieval-augmented generation pipeline over ChromaDB, so its output is grounded in real shipping-disruption data instead of model recall. Built with Claude Code.
status note (neutral): Personal prototype
stack: Python, Anthropic Claude API, CrewAI, RAG, ChromaDB
diagram: watchtower-flow

## Demand Forecasting & Inventory Optimization
status: academic
date: 2026, ongoing
context: MS capstone, team of four
one-liner: Forecasting demand across 250 SKU and warehouse series, with a strict time-based test window.
impact: 27.7% WAPE vs. 38.5% naive baseline
highlight: Turned the forecast into a reorder-point policy that cuts simulated holding cost about 28% at comparable service levels.
credit: Team project with Rakshit Govind Thota, Sanjana Parmareddy Gari, and Yashwanth Sai Tondapu.
stack: Python, LightGBM, Prophet, scikit-learn

## End-to-End CI/CD Deployment Pipeline
status: personal
date: October 2026
one-liner: Multi-tier AWS environment in Terraform, parameterized so one codebase deploys dev or prod.
highlight: GitHub Actions runs tests on every push to main, builds a Docker image, pushes to ECR, and triggers a Terraform deploy.
stack: Terraform, Docker, GitHub Actions, AWS
link repo: https://github.com/SrujanRudrapati/aws-cicd-pipeline

## WLAN Traffic Forensics Toolkit
status: academic
date: January to May 2026
context: Built as a TA for ACO 430 under Prof. Feng Wang
one-liner: Rebuilds the network topology as a directed graph and classifies device types with K-Means clustering.
impact: 100,000+ WPA2-encrypted packets parsed
highlight: A Z-score detector on top caught a live denial-of-service deauthentication attack.
stack: Python, Pyshark, NetworkX, scikit-learn

## F1 Race Outcome Predictor
status: personal
date: March 2026
one-liner: Ranks drivers by win probability, with rolling features shifted forward to prevent look-ahead leakage.
impact: 80% top-3 accuracy vs. 73% baseline
highlight: Backtested on 44 held-out races: 52% top-1 and 80% top-3 accuracy, against a 43% / 73% baseline.
stack: Python, scikit-learn, HistGradientBoosting

## Containerized Flask Service on Kubernetes
status: personal
date: September 2026
one-liner: Flask API with Postgres and Redis in a multi-stage Dockerfile, run locally through docker-compose and deployed to a local kind cluster.
stack: Docker, docker-compose, Kubernetes (kind)

## Real-Time Group Chat Application
status: personal
date: 2023
one-liner: Multi-client chat in Core Java.
highlight: A server handles concurrent TCP socket connections and broadcasts messages, with client and server code kept modular.
stack: Java, Swing, AWT, TCP sockets

## Hand Gesture Controlled RC Car
status: academic
context: B.Tech major project, team of three
one-liner: An RC car steered by hand gestures, read by an accelerometer and sent over RF.
highlight: Arduino C++, ADXL335 accelerometer, RF modules with HT12E/HT12D encoder and decoder, L298 motor driver, IR obstacle detection; tested in Gazebo simulation.
stack: Arduino C++, ADXL335, RF HT12E/HT12D, L298, Gazebo

## Tech Assistant, Surplus Operations, Arizona State University
place: Tempe, AZ
dates: June 2026 to present
- Built Surplus AI, a private, offline AI system for ASU Surplus, now in production.
- Built a Power BI dashboard on asset sorting data showing where items stall.
- Advise university departments and outside buyers on what equipment fits their needs.

## Graduate Teaching Assistant, Arizona State University
place: Network Security & Wireless Networks, Glendale, AZ
dates: August 2025 to May 2026
- Designed hands-on labs for two 400-level networking courses covering traffic analysis and packet-level debugging.
- Held office hours for 40+ students.
- Built and presented the WLAN forensics toolkit to the class.

## Associate, Data Engineering, Celebal Technologies
place: Jaipur, India
dates: September 2022 to November 2024
summary: A data and AI consultancy. I worked on client engagements across healthcare, energy, manufacturing, and e-commerce, mostly on Azure Databricks.
- Telehealth client in New Zealand, Microsoft Fabric: Clinical and operations teams were waiting days for reports. I designed the Lakehouse architecture and coordinated a five-person team. Time-to-insight dropped about 50%, and the dashboards ended up in their weekly operational meetings.
- A US materials engineering client, AWS: Ran a production pipeline on Glue, S3, and Redshift handling about 10 million records a day from 7+ source systems, and was on call for it. Cut downtime about 30% by tracing recurring failures to root causes instead of patching them.
- A major fashion e-commerce client, Databricks: Kafka and Spark pipelines on Databricks modeling impressions, clicks, conversions, spend, and attribution, with Power BI dashboards on top.
- A major US utility, data governance (10 months): Their Microsoft Purview catalog was maintained by hand. I built automation on Databricks that pushed entities and custom classifications into Purview on a schedule, plus Apache Atlas lineage pipelines and a business glossary mapped to their governance policies.
- Medallion architecture on Databricks: Built bronze, silver, and gold layers plus a serving layer on Azure Databricks and Delta Lake. Wrote the Spark transformations and dbt models.
- A US medical device manufacturer: Audited their existing Azure Data Factory pipelines before changing anything, and shipped updates with zero disruption to production.
- A large FMCG client: Data governance engineer, using Unity Catalog alongside Microsoft Purview to manage access, lineage, and classification across the Databricks workspace.
- Production ML pipeline: Built the Spark and Databricks pipelines feeding a production machine learning model, worked with the data science team on feature engineering, and built the serving layer that delivered model-ready data.
- A/B testing: Built the pipelines feeding experiment data, set up test and control assignment logic, and ran the statistical analysis on results.
- Performance and cost: Tuned Spark jobs and SQL on Databricks for performance and cost.
- Code review and mentoring: Reviewed teammates' code as senior data engineer on one project, and mentored two interns.
- Pre-sales: Wrote Azure cloud architectures and Bill-of-Materials cost estimates, and presented them directly to prospective clients alongside the sales team.

## Intern, Data Engineering, Celebal Technologies
place: Jaipur, India
dates: July to August 2022

```

## Hero, about and contact (src/content/portfolio.ts)

```
headline: I build the data layer, and the AI on top of it.
subline: Data engineer working across Databricks, Azure, and AWS. Lately building LLM systems that run on real data.
now: M.S. student at Arizona State University. Graduating December 2026, available early 2027.
status: Graduating December 2026, available early 2027
chip: Surplus AI, in production at ASU Surplus
chip: Two years of data engineering at Celebal
chip: Databricks Certified Data Engineer Professional
about: I'm a data engineer finishing an M.S. in Data Science, Analytics, and Engineering at Arizona State University. Before that I spent two years at Celebal Technologies building data platforms on Azure Databricks for clients in healthcare, energy, manufacturing, and e-commerce. Lately I build LLM systems that run on real data, like a private, offline AI system for ASU Surplus. I graduate in December 2026 and I'm available early 2027.
email: rudrapati.srujan@gmail.com
resume: /resume.pdf
linkedin: https://www.linkedin.com/in/srujan-rudrapati
github: https://github.com/SrujanRudrapati
certification: Databricks Certified Data Engineer Professional
certification: AWS Certified AI Practitioner
certification: Microsoft Certified: Azure Data Engineer Associate
certification: Microsoft Certified: Azure Administrator Associate
education: M.S. in Data Science, Analytics, and Engineering | Arizona State University | Expected December 2026 | GPA 3.96 / 4.0
education: B.Tech in Computer Science | Rajasthan Technical University | 2019 to 2023 | GPA 3.38 / 4.0
```
