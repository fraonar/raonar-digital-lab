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
  
  // experience fields
  organization?: string;
  endDate?: string;
  location?: string;
  
  // skills categories
  categories?: { name: string; items: string[] }[];
  
  // site-settings properties & catch-all
  [key: string]: any;
}

export interface ContentNode {
  slug: string;
  type: "project" | "lab-notebook" | "research-note" | "paper" | "resource" | "experience";
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
 * Custom frontmatter YAML parser.
 * Handles single values, inline arrays, and indented structures like categories and lists.
 */
export function parseYAML(yamlText: string): any {
  const lines = yamlText.split(/\r?\n/);
  const root: any = {};
  const path: { indent: number; ref: any; key?: string; isArray?: boolean }[] = [
    { indent: -1, ref: root }
  ];

  for (let line of lines) {
    // Strip comments, but avoid stripping URLs with double slashes
    const commentIndex = line.indexOf('#');
    if (commentIndex !== -1 && !line.includes('http://') && !line.includes('https://')) {
      line = line.slice(0, commentIndex);
    }
    if (!line.trim()) continue;

    const indent = line.search(/\S/);
    const trimmed = line.trim();

    // Pop path stack to match current indentation
    while (path.length > 1 && path[path.length - 1].indent >= indent) {
      path.pop();
    }

    const parent = path[path.length - 1];

    if (trimmed.startsWith('-')) {
      const listValText = trimmed.slice(1).trim();

      // Ensure parent is initialized as an array if it was a placeholder key
      if (parent.key && !parent.isArray) {
        parent.ref[parent.key] = [];
        parent.isArray = true;
      }

      const arrayRef = parent.key ? parent.ref[parent.key] : parent.ref;

      if (listValText.includes(':')) {
        // Object item in list, e.g. - name: "Signal Processing"
        const colonIndex = listValText.indexOf(':');
        const k = listValText.slice(0, colonIndex).trim();
        let v: any = listValText.slice(colonIndex + 1).trim().replace(/^['"]|['"]$/g, "");
        const obj = { [k]: v };
        arrayRef.push(obj);

        path.push({ indent, ref: obj, isArray: false });
      } else {
        // Simple value item in list, e.g. - "sEMG pattern recognition"
        const v = listValText.replace(/^['"]|['"]$/g, "");
        arrayRef.push(v);
      }
    } else if (trimmed.includes(':')) {
      const colonIndex = trimmed.indexOf(':');
      const key = trimmed.slice(0, colonIndex).trim();
      let val = trimmed.slice(colonIndex + 1).trim();

      val = val.replace(/^['"]|['"]$/g, "");

      const targetObj = parent.ref;

      if (val === '') {
        // Nested object starts
        targetObj[key] = {};
        path.push({ indent, ref: targetObj, key, isArray: false });
      } else if (val.startsWith('[') && val.endsWith(']')) {
        // Inline array
        targetObj[key] = val
          .slice(1, -1)
          .split(',')
          .map(s => s.trim().replace(/^['"]|['"]$/g, ""))
          .filter(Boolean);
      } else {
        // Simple key-value
        targetObj[key] = val;
      }
    }
  }

  return root;
}

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

  // Parse YAML frontmatter using our custom nested parser
  const frontmatter = parseYAML(fmText);

  // Fill in default placeholders if missing to prevent compiler crashes when files are added
  const filename = filePath.split("/").pop() || "";
  if (!frontmatter.title) {
    const baseName = filename.replace(/\.(md|mdx)$/, "");
    frontmatter.title = baseName
      .split(/[-_]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  if (!frontmatter.date) {
    frontmatter.date = new Date().toISOString().slice(0, 10);
  }

  // Determine type and slug
  const cleanPath = filePath.replace(/^\//, ""); // remove leading slash
  const parts = cleanPath.split("/");
  const section = parts[1]; // "projects", "lab-notebook", "research-notes", "papers", "resources", "experience"

  let type: ContentNode["type"] = "resource";
  let topic: string | undefined;
  let slug = "";

  if (filename === "current-mission.md" || filename === "current-mission.mdx") {
    type = "resource";
    slug = "current-mission";
  } else if (filename === "profile.md" || filename === "profile.mdx") {
    type = "resource";
    slug = "profile";
  } else if (filename === "site-settings.md" || filename === "site-settings.mdx") {
    type = "resource";
    slug = "site-settings";
  } else if (filename === "skills.md" || filename === "skills.mdx") {
    type = "resource";
    slug = "skills";
  } else if (section === "projects") {
    type = "project";
    slug = filename.replace(/\.(md|mdx)$/, "");
  } else if (section === "lab-notebook") {
    type = "lab-notebook";
    slug = filename.replace(/\.(md|mdx)$/, "");
  } else if (section === "research-notes") {
    type = "research-note";
    topic = parts[2];
    slug = filename.replace(/\.(md|mdx)$/, "");
  } else if (section === "papers") {
    type = "paper";
    slug = filename.replace(/\.(md|mdx)$/, "");
  } else if (section === "experience") {
    type = "experience";
    slug = filename.replace(/\.(md|mdx)$/, "");
  } else if (section === "resources") {
    type = "resource";
    slug = filename.replace(/\.(md|mdx)$/, "");
  }

  return {
    slug,
    type: type as ContentNode["type"],
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
  return contentNodes.filter(
    (n) =>
      n.slug !== "current-mission" &&
      n.slug !== "profile" &&
      n.slug !== "site-settings" &&
      n.slug !== "skills" &&
      n.type !== "experience"
  );
}

export function getCurrentMission(): ContentNode | undefined {
  return contentNodes.find((n) => n.slug === "current-mission");
}

export function getProfile(): ContentNode | undefined {
  return contentNodes.find((n) => n.slug === "profile");
}

export function getSiteSettings(): ContentNode | undefined {
  return contentNodes.find((n) => n.slug === "site-settings");
}

export function getSkills(): ContentNode | undefined {
  return contentNodes.find((n) => n.slug === "skills");
}

export function getExperience(): ContentNode[] {
  return contentNodes
    .filter((n) => n.type === "experience")
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    );
}

export function getProjects(): ContentNode[] {
  return contentNodes
    .filter((n) => n.type === "project")
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    );
}

export function getLabNotebook(): ContentNode[] {
  return contentNodes
    .filter((n) => n.type === "lab-notebook")
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    );
}

export function getResearchNotes(): ContentNode[] {
  return contentNodes.filter((n) => n.type === "research-note");
}

export function getResearchNotesByTopic(): Record<string, ContentNode[]> {
  const notes = getResearchNotes();
  const grouped: Record<string, ContentNode[]> = {};
  for (const note of notes) {
    const t = note.frontmatter.topic || note.topic || "General";
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
  return contentNodes.filter((n) => n.type === "resource" && n.slug !== "current-mission" && n.slug !== "profile" && n.slug !== "site-settings" && n.slug !== "skills");
}

/**
 * Computes live laboratory metrics automatically by parsing content data.
 */
export function getStats() {
  const projects = getProjects();
  const papers = getPapers();
  const logs = getLabNotebook();
  const notes = getResearchNotes();

  const projectsCount = projects.length;
  const papersRead = papers.length;
  const notesLog = notes.length;
  const totalExperiments = logs.length;
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
  const filteredNodes = getAllNodes();
  const nodes: GraphNode[] = filteredNodes.map((n) => ({
    id: n.slug,
    label: n.frontmatter.title,
    type: n.type,
  }));

  const links: GraphLink[] = [];
  for (const node of filteredNodes) {
    const targets = node.frontmatter.links || [];
    for (const target of targets) {
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
