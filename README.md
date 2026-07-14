# Raonar's Digital Engineering Laboratory Notebook

Welcome to the codebase of your personal **Digital Laboratory website**. 

Unlike a flat blog, this site is engineered to act as a living **knowledge base and research wiki**. Every article, log, project, and scientific paper review connects organically via **frontmatter links**, generating a **real-time interactive spring-force knowledge graph** and localized **backlinks directories**.

---

## Technical Architecture

The site runs on a highly optimized, dependency-isolated **React + TypeScript + Vite + Tailwind CSS v4** architecture.

1. **Content Pipeline (`src/lib/content.ts`)**:
   - Uses Vite's `import.meta.glob` to eager-load local Markdown/MDX files from the `/content` directory at build/compile time.
   - Parses metadata (frontmatter) and bodies using a customized, type-safe RegExp compiler.
   - **Automated Validation**: Scans frontmatter files during compilation. Missing required fields (e.g. `title` or `date`) trigger a readable developer-facing overlay, preventing silent broken links or runtime errors.
   - **Metrics Engine**: Computes stats dynamically (e.g. counting files, aggregating lab hours from notebook dates, counting peer-reviewed papers) rather than using static hardcoded fields.
2. **Backlinks & Knowledge Graph**:
   - Analyzes links in frontmatter arrays to resolve relations.
   - Generates an SVG-based spring-force directed layout using a custom-engineered physics loop. Supports high-performance panning, zoom, hover highlighting, and click-to-navigate.
3. **Custom Markdown & Math Renderer (`src/components/MarkdownRenderer.tsx`)**:
   - A fully bespoke renderer optimized for **React 19** compatibility (no external dependencies subject to JSX type-mismatches).
   - Renders headers, lists, code fences (with copy-to-clipboard actions), and blockquotes.
   - **LaTeX Block & Inline Math**: Automatically parses and formats equations wrapped in `$$` (block equations) and `$` (inline variables).
   - Intercepts relative links to resolve wiki-style document hopping.

---

## Content Directory Structure

All content is authored in Markdown or MDX under the `/content` directory.

```
/content
  ├── current-mission.mdx         <-- Holds home page core focus, bottleneck, and milestone
  ├── projects/
  │     └── [slug].mdx            <-- Flagship research & engineering projects
  ├── lab-notebook/
  │     └── [slug].mdx            <-- Reverse-chronological dated engineering logs
  ├── research-notes/
  │     └── {topic}/
  │           └── [slug].mdx      <-- Deep technical digests grouped by topic (DSP, Embedded, etc.)
  ├── papers/
  │     └── [slug].mdx            <-- Reviews & ratings of academic literature
  └── resources/
        └── tools.mdx             <-- Index of datasets, software APIs, and hardware gear
```

---

## Frontmatter Metadata Schemas

To ensure clean builds, verify that any new file you add conforms to these frontmatter requirements.

### 1. Project Schema (`/content/projects/*.mdx`)
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

### 2. Lab Notebook Schema (`/content/lab-notebook/*.mdx`)
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

### 3. Research Note Schema (`/content/research-notes/{topic}/*.mdx`)
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

### 4. Paper Review Schema (`/content/papers/*.mdx`)
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

## Exporting, Obsidian Vault Integration, & Auto-Deployment

This website is engineered to be a **zero-maintenance static wiki**. Because it uses hash-based routing and compiles local Markdown/MDX files at build time, you can publish updates simply by pushing files to GitHub.

Here is the exact step-by-step playbook to export this project, connect it to your local Obsidian vault, and generate a permanent live link that updates automatically for your LinkedIn profile.

---

### Phase 1: Export to GitHub
First, we need to move this codebase from AI Studio into your own GitHub account.
1. In the top right corner of the AI Studio interface, click the **Settings (gear) icon** or the **Share menu**.
2. Select **Export to GitHub**.
3. Follow the prompts to authenticate and create a new repository (e.g., `digital-lab-portfolio`).

---

### Phase 2: Connect Your Obsidian Vault
Now, we link your local markdown writing environment to the codebase.
1. Open your computer's terminal and clone your new GitHub repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/digital-lab-portfolio.git
   ```
2. Open Obsidian. Click **"Open folder as vault"** and select the `content/` folder inside the repository you just cloned. (This is where the app dynamically reads all your markdown files).
3. Inside Obsidian, go to **Community Plugins** and install **Obsidian Git**.
4. Configure Obsidian Git to auto-commit and auto-push every X minutes. Now, every time you write or edit a note in Obsidian, it will automatically push those markdown changes to your GitHub repository.

---

### Phase 3: Setup Auto-Deployment (The Live Link)
To get a production-ready link that automatically updates when you write in Obsidian, use a platform like Vercel or Netlify (both have free tiers perfect for this).
1. Go to [Vercel.com](https://vercel.com) and sign in with your GitHub account.
2. Click **Add New Project** and import your `digital-lab-portfolio` repository.
3. Vercel will automatically detect that this is a Vite/React project. Leave the default build settings (`npm run build` and `dist` directory) and click **Deploy**.
4. Within a minute, Vercel will give you a live production URL (e.g., `digital-lab-portfolio.vercel.app`).

*(Alternative: You can also use the pre-configured GitHub Actions workflow in `.github/workflows/deploy.yml` for GitHub Pages. Simply go to **Settings** -> **Pages** in your repository and select **GitHub Actions** as the source).*

---

### Phase 4: Final Polish for LinkedIn
1. **Custom Domain (Optional)**: In your Vercel project settings, go to **"Domains"** and add your custom domain (e.g., `ronarana.com`). Follow Vercel's instructions to update your DNS records with your registrar.
2. **Post to LinkedIn**: Take your final Vercel link or custom domain and add it to your LinkedIn profile.

**The Final Result**: You never have to touch the code again. You write a markdown file in Obsidian, Obsidian Git pushes it silently in the background, Vercel detects the change, and your live LinkedIn portfolio updates automatically.

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
