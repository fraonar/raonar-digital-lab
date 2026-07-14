/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Frontmatter {
  title: string;
  date: string;
  tags?: string[];
  status?: "active" | "completed" | "planned" | string;
  links?: string[];
  topic?: string;
  bottleneck?: string;
  milestone?: string;
  summary?: string;
  author?: string;
  rating?: string;
  building?: string;
  subtitle?: string;
  role?: string;
  avatarUrl?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  scholar?: string;
  domain?: string;
}

export interface ContentNode {
  slug: string;
  type: "project" | "lab-notebook" | "research-note" | "paper" | "resource";
  path: string;
  frontmatter: Frontmatter;
  content: string;
  topic?: string;
}

// Read raw file content via Vite's import.meta.glob for both md and mdx
const modules = (import.meta as any).glob("/content/**/*.{md,mdx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/**
 * Custom frontmatter and MDX parser.
 * Handles YAML-like syntax and extracts both metadata and content.
 */
export function parseMDX(filePath: string, rawText: string): ContentNode {
  const fmRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = rawText.match(fmRegex);

  let fmText = "";
  let body = rawText;

  if (match) {
    fmText = match[1];
    body = rawText.replace(fmRegex, "");
  }

  const lines = fmText.split("\n");
  const frontmatter: any = {
    title: "",
    date: "",
    tags: [],
    links: [],
  };

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    let val = line.slice(colonIndex + 1).trim();

    // Remove outer quotes if present
    val = val.replace(/^['"]|['"]$/g, "");

    if (val.startsWith("[") && val.endsWith("]")) {
      // Parse inline list, e.g. ["a", "b"]
      frontmatter[key] = val
        .slice(1, -1)
        .split(",")
        .map((item) => item.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
    } else {
      frontmatter[key] = val;
    }
  }

  // Validate required frontmatter fields
  const requiredFields: (keyof Frontmatter)[] = ["title", "date"];
  const missing: string[] = [];
  for (const field of requiredFields) {
    if (!frontmatter[field]) {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Metadata validation failed for file "${filePath}": Missing required frontmatter fields: [${missing.join(
        ", "
      )}]. Please ensure these are populated.`
    );
  }

  // Determine type and slug
  // Path format: /content/projects/myohand.mdx or /content/research-notes/dsp/fourier-transforms.mdx
  const cleanPath = filePath.replace(/^\//, ""); // remove leading slash
  const parts = cleanPath.split("/");
  const section = parts[1]; // "projects", "lab-notebook", "research-notes", "papers", "resources"

  let type: ContentNode["type"] = "resource";
  let topic: string | undefined;
  let slug = "";

  const filename = parts[parts.length - 1];

  if (filename === "current-mission.md" || filename === "current-mission.mdx") {
    type = "resource";
    slug = "current-mission";
  } else if (filename === "profile.md" || filename === "profile.mdx") {
    type = "resource";
    slug = "profile";
  } else if (section === "projects") {
    type = "project";
    slug = filename.replace(/\.(md|mdx)$/, "");
  } else if (section === "lab-notebook") {
    type = "lab-notebook";
    slug = filename.replace(/\.(md|mdx)$/, "");
  } else if (section === "research-notes") {
    type = "research-note";
    topic = parts[2]; // e.g. "dsp", "embedded"
    slug = filename.replace(/\.(md|mdx)$/, "");
  } else if (section === "papers") {
    type = "paper";
    slug = filename.replace(/\.(md|mdx)$/, "");
  } else if (section === "resources") {
    type = "resource";
    slug = filename.replace(/\.(md|mdx)$/, "");
  }

  return {
    slug,
    type,
    path: filePath,
    frontmatter: frontmatter as Frontmatter,
    content: body,
    topic,
  };
}

// Parse all loaded files
let contentNodes: ContentNode[] = [];
let parsingError: string | null = null;

try {
  contentNodes = Object.entries(modules).map(([filePath, rawText]) => {
    return parseMDX(filePath, rawText);
  });
} catch (err: any) {
  console.error("Content Compilation Error:", err);
  parsingError = err.message || String(err);
}

export function getContentError(): string | null {
  return parsingError;
}

export function getAllNodes(): ContentNode[] {
  return contentNodes.filter((n) => n.slug !== "current-mission" && n.slug !== "profile");
}

export function getCurrentMission(): ContentNode | undefined {
  return contentNodes.find((n) => n.slug === "current-mission");
}

export function getProfile(): ContentNode | undefined {
  return contentNodes.find((n) => n.slug === "profile");
}

export function getProjects(): ContentNode[] {
  return contentNodes
    .filter((n) => n.type === "project" && n.slug !== "current-mission" && n.slug !== "profile")
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    );
}

export function getLabNotebook(): ContentNode[] {
  return contentNodes
    .filter((n) => n.type === "lab-notebook" && n.slug !== "current-mission" && n.slug !== "profile")
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    );
}

export function getResearchNotes(): ContentNode[] {
  return contentNodes.filter((n) => n.type === "research-note" && n.slug !== "current-mission" && n.slug !== "profile");
}

export function getResearchNotesByTopic(): Record<string, ContentNode[]> {
  const notes = getResearchNotes();
  const grouped: Record<string, ContentNode[]> = {};
  for (const note of notes) {
    const t = note.frontmatter.topic || note.topic || "General";
    // Normalize casing for display
    const formattedTopic = t.toUpperCase();
    if (!grouped[formattedTopic]) {
      grouped[formattedTopic] = [];
    }
    grouped[formattedTopic].push(note);
  }
  return grouped;
}

export function getPapers(): ContentNode[] {
  return contentNodes
    .filter((n) => n.type === "paper")
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    );
}

export function getResources(): ContentNode[] {
  return contentNodes.filter((n) => n.type === "resource" && n.slug !== "current-mission" && n.slug !== "profile");
}

/**
 * Computes live laboratory metrics automatically by parsing content data.
 */
export function getStats() {
  const projects = getProjects();
  const papers = getPapers();
  const logs = getLabNotebook();
  const notes = getResearchNotes();

  // Standard engineering heuristic stats driven by parsed data
  const projectsCount = projects.length;
  const papersRead = papers.length;
  const notesLog = notes.length;
  
  // Total hours and experiments can be derived or aggregated
  const totalExperiments = logs.length;
  // Estimate lab hours from dates (e.g. 24 hours per notebook entry + 120 per project)
  const estimatedLabHours = logs.length * 12 + projectsCount * 120 + 80;

  return {
    projectsCount,
    papersRead,
    notesLog,
    totalExperiments,
    estimatedLabHours,
  };
}

/**
 * Finds all content nodes that link to the target slug.
 */
export function getBacklinks(targetSlug: string): ContentNode[] {
  return contentNodes.filter((node) => {
    // Avoid linking to self
    if (node.slug === targetSlug) return false;
    
    const links = node.frontmatter.links || [];
    return links.includes(targetSlug);
  });
}

/**
 * Searches and retrieves a specific node by its slug.
 */
export function getNodeBySlug(slug: string): ContentNode | undefined {
  return contentNodes.find((n) => n.slug === slug);
}

/**
 * Generates elements for a knowledge graph representation.
 */
export interface GraphNode {
  id: string;
  label: string;
  type: ContentNode["type"];
}

export interface GraphLink {
  source: string;
  target: string;
}

export function getKnowledgeGraph(): { nodes: GraphNode[]; links: GraphLink[] } {
  const filteredNodes = contentNodes.filter((n) => n.slug !== "current-mission" && n.slug !== "profile");
  const nodes: GraphNode[] = filteredNodes.map((n) => ({
    id: n.slug,
    label: n.frontmatter.title,
    type: n.type,
  }));

  const links: GraphLink[] = [];
  for (const node of filteredNodes) {
    const targets = node.frontmatter.links || [];
    for (const target of targets) {
      // Only link if the target node exists
      if (filteredNodes.some((n) => n.slug === target)) {
        links.push({
          source: node.slug,
          target,
        });
      }
    }
  }

  return { nodes, links };
}
