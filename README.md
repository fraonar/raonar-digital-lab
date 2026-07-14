# Raonar's Digital Engineering Laboratory Notebook

Welcome to the codebase of your personal **Digital Laboratory website**. 

Unlike a flat blog, this site is engineered to act as a living **knowledge base and research wiki**. Every article, log, project, and scientific paper review connects organically via **frontmatter links**, generating a **real-time interactive spring-force knowledge graph** and localized **backlinks directories**.

---

## Technical Architecture

The site runs on a highly optimized, dependency-isolated **React + TypeScript + Vite + Tailwind CSS v4** architecture.

1. **Content Pipeline (`src/lib/content.ts`)**:
   - Uses Vite's `import.meta.glob` to eager-load local Markdown files from the `/content` directory at build/compile time.
   - Parses metadata (frontmatter) and bodies using a custom-engineered nested YAML parser.
   - **Automated Validation**: Scans frontmatter files during compilation. Missing required fields (e.g. `title` or `date`) trigger a readable developer-facing overlay, preventing silent broken links or runtime errors.
   - **Metrics Engine**: Computes stats dynamically (e.g. counting files, aggregating lab hours from notebook dates, counting peer-reviewed papers) rather than using static hardcoded fields.
2. **Backlinks & Knowledge Graph**:
   - Analyzes links in frontmatter arrays to resolve relations.
   - Generates an SVG-based spring-force directed layout using a custom-engineered physics loop. Supports high-performance panning, zoom, hover highlighting, and click-to-navigate.
3. **Custom Markdown & Math Renderer (`src/components/MarkdownRenderer.tsx`)**:
   - A fully bespoke renderer optimized for **React 19** compatibility (no external dependencies subject to JSX type-mismatches).
   - Renders headers, lists, code fences (with copy-to-clipboard actions), blockquotes, and images (`![alt](path)`).
   - **LaTeX Block & Inline Math**: Automatically parses and formats equations wrapped in `$$` (block equations) and `$` (inline variables).
   - Intercepts relative links to resolve wiki-style document hopping.

---

## Content Directory Structure

All content is authored in pure Markdown (`.md`) under the `/content` directory.

```
/content
  ├── current-mission.md          <-- Holds home page core focus, bottleneck, and milestone
  ├── profile.md                  <-- Biography text, social/contact links, headshot path
  ├── site-settings.md            <-- All site UI text, nav labels, footer, and overlays
  ├── skills.md                   <-- Structured skills categories matrix
  ├── projects/
  │     └── [slug].md             <-- Flagship research & engineering projects
  ├── experience/
  │     └── [slug].md             <-- Professional history roles and timelines
  ├── lab-notebook/
  │     └── [slug].md             <-- Reverse-chronological dated engineering logs
  ├── research-notes/
  │     └── {topic}/
  │           └── [slug].md       <-- Deep technical digests grouped by topic (DSP, Embedded, etc.)
  ├── papers/
  │     └── [slug].md             <-- Reviews & ratings of academic literature
  ├── resources/
  │     └── tools.md              <-- Index of datasets, software APIs, and hardware gear
  └── images/
        └── [filename].png        <-- Local images/assets referenced in frontmatter or markdown body
```

---

## Frontmatter Metadata Schemas

To ensure clean builds, verify that any new file you add conforms to these frontmatter requirements.

### 1. Site Settings Schema (`/content/site-settings.md`)
Controls all copy, placeholders, text links, footer descriptions, and overlay strings. Example keys:
```yaml
---
title: "Site Settings"
site_title: "Digital Engineering Laboratory"  # Browser tab title
nav_home: "HOME"
nav_about: "ABOUT"
stats_projects: "Active Projects"
project_list_title: "Active Technical Projects"
...
---
```

### 2. Skills Matrix Schema (`/content/skills.md`)
Declares skills category cards and nested bullet items on the About page.
```yaml
---
title: "Structured Skills Index"
categories:
  - name: "Signal Processing"
    items:
      - "sEMG pattern recognition"
      - "FFT & STFT analysis"
  - name: "Embedded & Hardware"
    items:
      - "STM32 & RP2040 microcontrollers"
---
```

### 3. Experience Schema (`/content/experience/*.md`)
Generates timeline cards under the Professional Experience section on the About page.
Required fields: `title`, `organization`, `date`. Optional: `endDate`, `location`.
The Markdown body contains role responsibilities.
```yaml
---
title: "Neural Integration Specialist"
organization: "Neural Engineering Lab"
date: "2024-01-01"
endDate: "Present"
location: "San Francisco, CA"
---
- Developed low-latency analog front-ends...
- Optimized lightweight neural network classification...
```

### 4. Project Schema (`/content/projects/*.md`)
Required fields: `title`, `date`, `tags`, `status`, `summary`.
```yaml
---
title: "MyoHand: A Low-Cost EMG-Controlled Prosthetic Hand"
date: "2026-07-12"
tags: ["EMG", "Biomedical Signal Processing", "Robotics"]
status: "active"                      # Options: "active" | "completed" | "planned"
bottleneck: "Filtering out forearm muscle crosstalk during pinch grips." # Optional
milestone: "Designing PCB v2.0 for integrated telemetry."                 # Optional
links: ["spi-dma-acquisition", "hochberg-2012-reach"]                     # Optional
summary: "An open-source myoelectric prosthetic hand using localized pattern classification."
---
```

### 5. Lab Notebook Schema (`/content/lab-notebook/*.md`)
Required fields: `title`, `date`, `tags`, `summary`.
```yaml
---
title: "Amplifier PCB Routing and SPI Timing Fixed"
date: "2026-07-12"
tags: ["PCB", "STM32", "SPI", "Hardware"]
links: ["myohand", "spi-dma-acquisition"]
summary: "Successfully routed the front-end amplifier stage of MyoHand PCB v2."
---
```

### 6. Research Note Schema (`/content/research-notes/{topic}/*.md`)
Required fields: `title`, `date`, `tags`, `topic`, `summary`.
```yaml
---
title: "Direct Memory Access (DMA) and SPI Acquisition on ARM"
date: "2026-06-15"
tags: ["Embedded", "STM32", "DMA"]
topic: "Embedded"                     # MUST match the subdirectory name (case-insensitive)
links: ["myohand", "2026-07-12-amplifier-pcb-routing"]
summary: "Technical notes on configuring circular DMA buffers for zero-overhead biosignal sampling."
---
```

### 7. Paper Review Schema (`/content/papers/*.md`)
Required fields: `title`, `date`, `tags`, `author`, `rating`, `summary`.
```yaml
---
title: "Reach and grasp by people with tetraplegia using a neurally controlled robotic arm"
date: "2026-06-05"
tags: ["Paper Review", "BCI", "Robotics"]
author: "Hochberg et al. (Nature, 2012)"
rating: "5/5"                         # Star rating representation
links: ["synapsedecode", "motor-cortex-mapping"]
summary: "Seminal paper demonstrating robotic arm control via chronically implanted microelectrodes."
---
```

---

## Adding New Content via Obsidian

1. **Add a Project**: Create a new `.md` file in `/content/projects/` (e.g. `/content/projects/my-new-sensor.md`), fill in the required frontmatter properties (title, date, tags, status, summary), and write the markdown body.
2. **Add Experience Role**: Create a new `.md` file in `/content/experience/` (e.g. `/content/experience/researcher.md`), define its frontmatter (title, organization, date, endDate, location), and list accomplishments in the body.
3. **Change UI Text**: Open `/content/site-settings.md` and edit any text value (e.g. updating `hero_welcome`).

Once Obsidian Git auto-saves and pushes to GitHub, Vercel will automatically re-deploy your changes within 60 seconds.

---

## Local Development & Compilation

To test changes locally before pushing:

```bash
# Install dependencies
npm install

# Start local dev server (Runs on port 3000)
npm run dev

# Run static analysis/linter
npm run lint

# Build production assets (Vite compilation test)
npm run build
```
