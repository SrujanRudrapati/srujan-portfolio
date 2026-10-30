# Phase 4 content diff: old `src/content/portfolio.ts` (commit 1d08a21) vs new `src/data/projects.ts`

Generated 2026-10-30. Old side: a one-off dump of `surplusAI`, `watchtower`, `otherProjects`. New side: `node --experimental-strip-types scripts/content-dump.mts` (projects part; the experience part is unchanged in this phase and omitted below).

## Field mapping

| Old | New | Note |
|---|---|---|
| `tagline` | `oneLiner` | verbatim |
| `context` ("Built on the job, in active use", "Personal project, built solo", ...) | `context` | verbatim; the status badge word comes from the new `status` enum |
| Surplus `status.running` / `status.pending` / `status.detail` | `statusNotes` / `statusDetail` | verbatim; Phase 5 removes the "in progress" wording per facts 2.1 |
| Watchtower `status: "Personal prototype"` | `status: "personal"` + `context` | normalised to the five-word status vocabulary; "Personal project, built solo" keeps the meaning |
| `parts[]` (six) | `details.items[]` | verbatim, inside the "How it works" disclosure |
| `pipeline`, `nodes`, `privacyLayers`, `agents`, `tool`, `input`, `output` | SVG diagram labels in `src/components/diagrams/projectDiagrams.tsx` | verbatim labels; node IPs and roles kept |
| other `outcome` (two sentences) | `oneLiner` (first sentence) + `highlights[0]` (rest) | split, no words changed |
| other `figure` | `impact[0]` | verbatim |
| (none) | Surplus `impact`: "5 Mac minis in an offline cluster", "14B Qwen model split across four nodes with MLX" | counts restated from the "Five-node cluster" and "Surplus AI app" paragraphs already on the site |
| (none) | Watchtower `impact`: "3 agents in sequence on the Claude API" | restated from the `built` paragraph |
| (none) | Surplus `highlights` (three) | restated from the "Surplus AI app" and "Merge logic" paragraphs |
| `repo: null // TODO` | `links: {}` | no link, as before |

## Old dump

```
## Surplus AI
date: 2026
context: Built on the job, in active use
tagline: Private, offline AI system for ASU Surplus
problem: Surplus staff were typing hardware specs into a spreadsheet by hand, which introduced typos into the inventory. Writing product listings was also manual.
built: One connected pipeline: collect specs, build a master spreadsheet, and have AI write the listings, all on a private network that never touches the internet.
pipeline inputs: USB spec collector (system_profiler on each working Mac); Camera scanner (Vision OCR on the bottom label)
pipeline steps: Lookup table (Product, year, screen size, resale lane); Master inventory (Keyed on serial number); LLM (Strict prompt: never invent specs); Listings (Results saved)
How it works:
  - Five-node cluster: Five M1 Mac minis on a gigabit switch with no internet uplink, fixed IPs, and passwordless SSH from the head node. Apple's MLX framework splits one model across several machines with tensor parallelism, so a 14B model can run across Macs that can't hold it individually.
  - USB spec collector: A Bash script on a USB stick runs system_profiler on each Mac, reads model, chip, RAM, storage, battery health, and macOS version, looks up year and screen size from a reference table, and de-duplicates by serial number.
  - Camera inventory scanner: For Macs that won't boot, a webcam photographs the bottom label and Apple's Vision OCR reads the model number, EMC, and serial. These are matched against the lookup table to get product, year, screen size, and resale lane (Retail, Auction, or Parts).
  - Merge logic: Both sources land in one master inventory keyed on serial number, so a camera scan never overwrites real data from a working machine.
  - Surplus AI app: A Flask server runs two model engines: Qwen 14B across four nodes, and Llama 3B on one node for quick responses. Replies stream word by word. A Listings tab builds a strict prompt from each row's real specs, and a Cluster tab polls each node over SSH every 5 seconds.
  - Launchers: One double-click starts everything, waits for the engines to respond, and opens the app. Closing it shuts down every node.
nodes: 10.0.0.1 Head node; 10.0.0.2 (pending); 10.0.0.3 (pending); 10.0.0.4 (pending); 10.0.0.5
privacy layers: No uplink on the switch; Wi-Fi off; HF_HUB_OFFLINE=1, so the model software can't download anything; Model server only answers on localhost
privacy note: The app checks Wi-Fi and internet status live.
status: 3B engine runs now; 14B cluster engine in progress
status detail: Everything works except the 14B cluster engine, which is waiting on model files being copied to nodes 2 through 4.
stack: MLX, Flask, Bash, Apple Vision OCR, Qwen 14B, Llama 3B

## Autonomous Supply Chain Watchtower
date: November 2025
context: Personal project, built solo
tagline: Multi-agent LLM system
problem: Turning raw sales history into a logistics plan normally takes several manual steps by different people.
built: Three agents running in sequence on the native Anthropic Claude API through CrewAI, each consuming the previous agent's output. The Risk Analyst has a custom tool backed by a retrieval-augmented generation pipeline over ChromaDB, so its output is grounded in real shipping-disruption data instead of model recall. Built with Claude Code.
agents: Inventory Forecaster, Risk Analyst, Logistics Coordinator
tool: RAG tool (ChromaDB, shipping-disruption data)
input: Sales history; output: Logistics plan
status: Personal prototype
stack: Python, Anthropic Claude API, CrewAI, RAG, ChromaDB
repo: null

## Demand Forecasting & Inventory Optimization
date: 2026, in progress
context: MS capstone, team of four
figure: 27.7% WAPE vs. 38.5% naive baseline
outcome: Forecasting demand across 250 SKU and warehouse series, with a strict time-based test window. Turned the forecast into a reorder-point policy that cuts simulated holding cost about 28% at comparable service levels.
credit: Team project with Rakshit Govind Thota, Sanjana Parmareddy Gari, and Yashwanth Sai Tondapu.
stack: Python, LightGBM, Prophet, scikit-learn
repo: null

## End-to-End CI/CD Deployment Pipeline
date: October 2026
outcome: Multi-tier AWS environment in Terraform, parameterized so one codebase deploys dev or prod. GitHub Actions runs tests on every push to main, builds a Docker image, pushes to ECR, and triggers a Terraform deploy.
stack: Terraform, Docker, GitHub Actions, AWS
repo: https://github.com/SrujanRudrapati/aws-cicd-pipeline

## WLAN Traffic Forensics Toolkit
date: January to May 2026
context: Built as a TA for ACO 430 under Prof. Feng Wang
figure: 100,000+ WPA2-encrypted packets parsed
outcome: Rebuilds the network topology as a directed graph and classifies device types with K-Means clustering. A Z-score detector on top caught a live denial-of-service deauthentication attack.
stack: Python, Pyshark, NetworkX, scikit-learn
repo: null

## F1 Race Outcome Predictor
date: March 2026
figure: 80% top-3 accuracy vs. 73% baseline
outcome: Ranks drivers by win probability, with rolling features shifted forward to prevent look-ahead leakage. Backtested on 44 held-out races: 52% top-1 and 80% top-3 accuracy, against a 43% / 73% baseline.
stack: Python, scikit-learn, HistGradientBoosting
repo: null

## Containerized Flask Service on Kubernetes
date: September 2026
outcome: Flask API with Postgres and Redis in a multi-stage Dockerfile, run locally through docker-compose and deployed to a local kind cluster.
stack: Docker, docker-compose, Kubernetes (kind)
repo: null

## Real-Time Group Chat Application
date: 2023
outcome: Multi-client chat in Core Java. A server handles concurrent TCP socket connections and broadcasts messages, with client and server code kept modular.
stack: Java, Swing, AWT, TCP sockets
repo: null

```

## New dump

```
## Surplus AI
status: production (featured)
date: 2026
context: Built on the job, in active use
one-liner: Private, offline AI system for ASU Surplus
impact: 5 Mac minis in an offline cluster
impact: 14B Qwen model split across four nodes with MLX
problem: Surplus staff were typing hardware specs into a spreadsheet by hand, which introduced typos into the inventory. Writing product listings was also manual.
built: One connected pipeline: collect specs, build a master spreadsheet, and have AI write the listings, all on a private network that never touches the internet.
highlight: Two model engines: Qwen 14B across four nodes, and Llama 3B on one node for quick responses. Replies stream word by word.
highlight: Both spec sources land in one master inventory keyed on serial number, so a camera scan never overwrites real data from a working machine.
highlight: A Listings tab builds a strict prompt from each row's real specs, and a Cluster tab polls each node over SSH every 5 seconds.
How it works:
  - Five-node cluster: Five M1 Mac minis on a gigabit switch with no internet uplink, fixed IPs, and passwordless SSH from the head node. Apple's MLX framework splits one model across several machines with tensor parallelism, so a 14B model can run across Macs that can't hold it individually.
  - USB spec collector: A Bash script on a USB stick runs system_profiler on each Mac, reads model, chip, RAM, storage, battery health, and macOS version, looks up year and screen size from a reference table, and de-duplicates by serial number.
  - Camera inventory scanner: For Macs that won't boot, a webcam photographs the bottom label and Apple's Vision OCR reads the model number, EMC, and serial. These are matched against the lookup table to get product, year, screen size, and resale lane (Retail, Auction, or Parts).
  - Merge logic: Both sources land in one master inventory keyed on serial number, so a camera scan never overwrites real data from a working machine.
  - Surplus AI app: A Flask server runs two model engines: Qwen 14B across four nodes, and Llama 3B on one node for quick responses. Replies stream word by word. A Listings tab builds a strict prompt from each row's real specs, and a Cluster tab polls each node over SSH every 5 seconds.
  - Launchers: One double-click starts everything, waits for the engines to respond, and opens the app. Closing it shuts down every node.
status note (running): 3B engine runs now
status note (pending): 14B cluster engine in progress
status detail: Everything works except the 14B cluster engine, which is waiting on model files being copied to nodes 2 through 4.
stack: MLX, Flask, Bash, Apple Vision OCR, Qwen 14B, Llama 3B
diagram: surplus-pipeline, surplus-network, surplus-privacy

## Autonomous Supply Chain Watchtower
status: personal (featured)
date: November 2025
context: Personal project, built solo
one-liner: Multi-agent LLM system
impact: 3 agents in sequence on the Claude API
problem: Turning raw sales history into a logistics plan normally takes several manual steps by different people.
built: Three agents running in sequence on the native Anthropic Claude API through CrewAI, each consuming the previous agent's output. The Risk Analyst has a custom tool backed by a retrieval-augmented generation pipeline over ChromaDB, so its output is grounded in real shipping-disruption data instead of model recall. Built with Claude Code.
stack: Python, Anthropic Claude API, CrewAI, RAG, ChromaDB
diagram: watchtower-flow

## Demand Forecasting & Inventory Optimization
status: academic
date: 2026, in progress
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

```

## Unified diff (old → new)

```diff
--- /private/tmp/claude-501/-Users-srujan-srujan-portfolio/b0660bdc-58cd-4d55-9113-59a08e1e9d7e/scratchpad/old-content.txt	2026-10-29 22:29:14
+++ /dev/fd/12	2026-10-29 22:29:14
@@ -1,11 +1,15 @@
 ## Surplus AI
+status: production (featured)
 date: 2026
 context: Built on the job, in active use
-tagline: Private, offline AI system for ASU Surplus
+one-liner: Private, offline AI system for ASU Surplus
+impact: 5 Mac minis in an offline cluster
+impact: 14B Qwen model split across four nodes with MLX
 problem: Surplus staff were typing hardware specs into a spreadsheet by hand, which introduced typos into the inventory. Writing product listings was also manual.
 built: One connected pipeline: collect specs, build a master spreadsheet, and have AI write the listings, all on a private network that never touches the internet.
-pipeline inputs: USB spec collector (system_profiler on each working Mac); Camera scanner (Vision OCR on the bottom label)
-pipeline steps: Lookup table (Product, year, screen size, resale lane); Master inventory (Keyed on serial number); LLM (Strict prompt: never invent specs); Listings (Results saved)
+highlight: Two model engines: Qwen 14B across four nodes, and Llama 3B on one node for quick responses. Replies stream word by word.
+highlight: Both spec sources land in one master inventory keyed on serial number, so a camera scan never overwrites real data from a working machine.
+highlight: A Listings tab builds a strict prompt from each row's real specs, and a Cluster tab polls each node over SSH every 5 seconds.
 How it works:
   - Five-node cluster: Five M1 Mac minis on a gigabit switch with no internet uplink, fixed IPs, and passwordless SSH from the head node. Apple's MLX framework splits one model across several machines with tensor parallelism, so a 14B model can run across Macs that can't hold it individually.
   - USB spec collector: A Bash script on a USB stick runs system_profiler on each Mac, reads model, chip, RAM, storage, battery health, and macOS version, looks up year and screen size from a reference table, and de-duplicates by serial number.
@@ -13,65 +17,68 @@
   - Merge logic: Both sources land in one master inventory keyed on serial number, so a camera scan never overwrites real data from a working machine.
   - Surplus AI app: A Flask server runs two model engines: Qwen 14B across four nodes, and Llama 3B on one node for quick responses. Replies stream word by word. A Listings tab builds a strict prompt from each row's real specs, and a Cluster tab polls each node over SSH every 5 seconds.
   - Launchers: One double-click starts everything, waits for the engines to respond, and opens the app. Closing it shuts down every node.
-nodes: 10.0.0.1 Head node; 10.0.0.2 (pending); 10.0.0.3 (pending); 10.0.0.4 (pending); 10.0.0.5
-privacy layers: No uplink on the switch; Wi-Fi off; HF_HUB_OFFLINE=1, so the model software can't download anything; Model server only answers on localhost
-privacy note: The app checks Wi-Fi and internet status live.
-status: 3B engine runs now; 14B cluster engine in progress
+status note (running): 3B engine runs now
+status note (pending): 14B cluster engine in progress
 status detail: Everything works except the 14B cluster engine, which is waiting on model files being copied to nodes 2 through 4.
 stack: MLX, Flask, Bash, Apple Vision OCR, Qwen 14B, Llama 3B
+diagram: surplus-pipeline, surplus-network, surplus-privacy
 
 ## Autonomous Supply Chain Watchtower
+status: personal (featured)
 date: November 2025
 context: Personal project, built solo
-tagline: Multi-agent LLM system
+one-liner: Multi-agent LLM system
+impact: 3 agents in sequence on the Claude API
 problem: Turning raw sales history into a logistics plan normally takes several manual steps by different people.
 built: Three agents running in sequence on the native Anthropic Claude API through CrewAI, each consuming the previous agent's output. The Risk Analyst has a custom tool backed by a retrieval-augmented generation pipeline over ChromaDB, so its output is grounded in real shipping-disruption data instead of model recall. Built with Claude Code.
-agents: Inventory Forecaster, Risk Analyst, Logistics Coordinator
-tool: RAG tool (ChromaDB, shipping-disruption data)
-input: Sales history; output: Logistics plan
-status: Personal prototype
 stack: Python, Anthropic Claude API, CrewAI, RAG, ChromaDB
-repo: null
+diagram: watchtower-flow
 
 ## Demand Forecasting & Inventory Optimization
+status: academic
 date: 2026, in progress
 context: MS capstone, team of four
-figure: 27.7% WAPE vs. 38.5% naive baseline
-outcome: Forecasting demand across 250 SKU and warehouse series, with a strict time-based test window. Turned the forecast into a reorder-point policy that cuts simulated holding cost about 28% at comparable service levels.
+one-liner: Forecasting demand across 250 SKU and warehouse series, with a strict time-based test window.
+impact: 27.7% WAPE vs. 38.5% naive baseline
+highlight: Turned the forecast into a reorder-point policy that cuts simulated holding cost about 28% at comparable service levels.
 credit: Team project with Rakshit Govind Thota, Sanjana Parmareddy Gari, and Yashwanth Sai Tondapu.
 stack: Python, LightGBM, Prophet, scikit-learn
-repo: null
 
 ## End-to-End CI/CD Deployment Pipeline
+status: personal
 date: October 2026
-outcome: Multi-tier AWS environment in Terraform, parameterized so one codebase deploys dev or prod. GitHub Actions runs tests on every push to main, builds a Docker image, pushes to ECR, and triggers a Terraform deploy.
+one-liner: Multi-tier AWS environment in Terraform, parameterized so one codebase deploys dev or prod.
+highlight: GitHub Actions runs tests on every push to main, builds a Docker image, pushes to ECR, and triggers a Terraform deploy.
 stack: Terraform, Docker, GitHub Actions, AWS
-repo: https://github.com/SrujanRudrapati/aws-cicd-pipeline
+link repo: https://github.com/SrujanRudrapati/aws-cicd-pipeline
 
 ## WLAN Traffic Forensics Toolkit
+status: academic
 date: January to May 2026
 context: Built as a TA for ACO 430 under Prof. Feng Wang
-figure: 100,000+ WPA2-encrypted packets parsed
-outcome: Rebuilds the network topology as a directed graph and classifies device types with K-Means clustering. A Z-score detector on top caught a live denial-of-service deauthentication attack.
+one-liner: Rebuilds the network topology as a directed graph and classifies device types with K-Means clustering.
+impact: 100,000+ WPA2-encrypted packets parsed
+highlight: A Z-score detector on top caught a live denial-of-service deauthentication attack.
 stack: Python, Pyshark, NetworkX, scikit-learn
-repo: null
 
 ## F1 Race Outcome Predictor
+status: personal
 date: March 2026
-figure: 80% top-3 accuracy vs. 73% baseline
-outcome: Ranks drivers by win probability, with rolling features shifted forward to prevent look-ahead leakage. Backtested on 44 held-out races: 52% top-1 and 80% top-3 accuracy, against a 43% / 73% baseline.
+one-liner: Ranks drivers by win probability, with rolling features shifted forward to prevent look-ahead leakage.
+impact: 80% top-3 accuracy vs. 73% baseline
+highlight: Backtested on 44 held-out races: 52% top-1 and 80% top-3 accuracy, against a 43% / 73% baseline.
 stack: Python, scikit-learn, HistGradientBoosting
-repo: null
 
 ## Containerized Flask Service on Kubernetes
+status: personal
 date: September 2026
-outcome: Flask API with Postgres and Redis in a multi-stage Dockerfile, run locally through docker-compose and deployed to a local kind cluster.
+one-liner: Flask API with Postgres and Redis in a multi-stage Dockerfile, run locally through docker-compose and deployed to a local kind cluster.
 stack: Docker, docker-compose, Kubernetes (kind)
-repo: null
 
 ## Real-Time Group Chat Application
+status: personal
 date: 2023
-outcome: Multi-client chat in Core Java. A server handles concurrent TCP socket connections and broadcasts messages, with client and server code kept modular.
+one-liner: Multi-client chat in Core Java.
+highlight: A server handles concurrent TCP socket connections and broadcasts messages, with client and server code kept modular.
 stack: Java, Swing, AWT, TCP sockets
-repo: null
 
```
