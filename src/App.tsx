/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  getProjects,
  getLabNotebook,
  getResearchNotesByTopic,
  getPapers,
  getResources,
  getStats,
  getCurrentMission,
  getBacklinks,
  getNodeBySlug,
  getAllNodes,
  getProfile,
  getSiteSettings,
  getSkills,
  getExperience,
  ContentNode,
  Frontmatter,
  getContentError,
} from "./lib/content";
import { MarkdownRenderer } from "./components/MarkdownRenderer";
import { KnowledgeGraph } from "./components/KnowledgeGraph";
import {
  Home,
  BookOpen,
  FolderCode,
  FileText,
  Compass,
  Mail,
  Sun,
  Moon,
  ArrowRight,
  Calendar,
  Tag,
  Clock,
  Layers,
  Award,
  Link2,
  ChevronRight,
  Sparkles,
  Search,
  User,
  Info,
  ExternalLink,
} from "lucide-react";

interface RouteState {
  view:
    | "home"
    | "about"
    | "projects"
    | "project-detail"
    | "lab-notebook"
    | "lab-detail"
    | "research-notes"
    | "research-detail"
    | "papers"
    | "paper-detail"
    | "resources"
    | "contact";
  slug?: string;
  topic?: string;
}

export default function App() {
  // Navigation & Router state
  const [route, setRoute] = useState<RouteState>({ view: "home" });
  const [isLight, setIsLight] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showGraph, setShowGraph] = useState(true);
  const [weeklyDigestMode, setWeeklyDigestMode] = useState(false);

  // Read hash on mount and on changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const cleanHash = hash.replace(/^#\/?/, "");
      if (!cleanHash) {
        setRoute({ view: "home" });
        return;
      }
      if (cleanHash === "about") {
        setRoute({ view: "about" });
        return;
      }
      if (cleanHash === "projects") {
        setRoute({ view: "projects" });
        return;
      }
      if (cleanHash.startsWith("projects/")) {
        const slug = cleanHash.split("/")[1];
        setRoute({ view: "project-detail", slug });
        return;
      }
      if (cleanHash === "lab-notebook") {
        setRoute({ view: "lab-notebook" });
        return;
      }
      if (cleanHash.startsWith("lab-notebook/")) {
        const slug = cleanHash.split("/")[1];
        setRoute({ view: "lab-detail", slug });
        return;
      }
      if (cleanHash === "research-notes") {
        setRoute({ view: "research-notes" });
        return;
      }
      if (cleanHash.startsWith("research-notes/")) {
        const parts = cleanHash.split("/");
        setRoute({ view: "research-detail", topic: parts[1], slug: parts[2] });
        return;
      }
      if (cleanHash === "papers") {
        setRoute({ view: "papers" });
        return;
      }
      if (cleanHash.startsWith("papers/")) {
        const slug = cleanHash.split("/")[1];
        setRoute({ view: "paper-detail", slug });
        return;
      }
      if (cleanHash === "resources") {
        setRoute({ view: "resources" });
        return;
      }
      if (cleanHash === "contact") {
        setRoute({ view: "contact" });
        return;
      }
      setRoute({ view: "home" });
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // trigger initial parse

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Update hash when router state is programmatically set
  const navigateTo = (view: RouteState["view"], slug?: string, topic?: string) => {
    let hash = "";
    if (view === "home") hash = "";
    else if (view === "about") hash = "about";
    else if (view === "projects") hash = "projects";
    else if (view === "project-detail" && slug) hash = `projects/${slug}`;
    else if (view === "lab-notebook") hash = "lab-notebook";
    else if (view === "lab-detail" && slug) hash = `lab-notebook/${slug}`;
    else if (view === "research-notes") hash = "research-notes";
    else if (view === "research-detail" && topic && slug)
      hash = `research-notes/${topic}/${slug}`;
    else if (view === "papers") hash = "papers";
    else if (view === "paper-detail" && slug) hash = `papers/${slug}`;
    else if (view === "resources") hash = "resources";
    else if (view === "contact") hash = "contact";

    window.location.hash = hash;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Load Content
  const stats = getStats();
  const currentMission = getCurrentMission();
  const profile = getProfile();
  const allNodes = getAllNodes();
  const allSlugs = allNodes.map((n) => n.slug);

  const siteSettings = getSiteSettings();
  const settingsFm: Frontmatter = siteSettings?.frontmatter || ({} as Frontmatter);

  const skillsNode = getSkills();
  const skillsCategories = skillsNode?.frontmatter.categories || [];
  const experienceList = getExperience();

  // Set browser title dynamically from settings
  useEffect(() => {
    if (settingsFm.site_title) {
      document.title = settingsFm.site_title;
    }
  }, [settingsFm.site_title]);

  // Filter nodes for quick global search
  const filteredSearchNodes = searchQuery
    ? allNodes.filter(
        (node) =>
          node.frontmatter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (node.frontmatter.tags || []).some((t) =>
            t.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : [];

  // Theme styling helpers
  const bgStyle = isLight ? "bg-[#F4F4F5] text-[#18181B]" : "bg-[#0A0A0B] text-[#D1D1D1]";
  const borderStyle = isLight ? "border-[#D4D4D8]" : "border-[#2D2D30]";
  const cardStyle = isLight
    ? "bg-white border-[#D4D4D8] shadow-xs"
    : "bg-[#111113] border-[#2D2D30]";
  const hoverCardStyle = isLight
    ? "hover:bg-[#FAF9F6] hover:border-[#32D74B] transition-all duration-200"
    : "hover:bg-[#161619] hover:border-[#32D74B] transition-all duration-200";
  const textSubtleStyle = isLight ? "text-[#71717A]" : "text-[#8E9299]";
  const codeBgStyle = isLight ? "bg-[#F4F4F5] text-[#15803D] border border-[#E4E4E7]" : "bg-[#131316] text-[#32D74B] border border-[#2D2D30]";

  // Check for configuration errors (unmatched frontmatter, missing fields etc.)
  const parsingError = getContentError();
  if (parsingError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-950/20 text-red-200 p-8 font-mono">
        <div className="max-w-2xl p-6 bg-zinc-900 border border-red-500/30 rounded-lg">
          <h2 className="text-xl font-bold text-red-400 flex items-center gap-2 mb-4">
            ⚠️ Markdown Frontmatter Validation Error
          </h2>
          <p className="text-sm mb-4 leading-relaxed">
            The laboratory compiler failed to build because one of your local Obsidian Markdown
            source files contains malformed metadata or lacks required fields:
          </p>
          <pre className="p-4 bg-zinc-950 border border-zinc-800 text-xs text-red-300 rounded overflow-x-auto whitespace-pre-wrap leading-normal">
            {parsingError}
          </pre>
          <div className="mt-6 text-xs text-zinc-500">
            Fix the metadata configuration in your `/content` directory to restore the lab environment.
          </div>
        </div>
      </div>
    );
  }

  // Formatting date string
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={`flex flex-col md:flex-row md:h-screen md:w-screen font-sans overflow-x-hidden md:overflow-hidden md:border-[12px] md:border-[#1A1A1C] relative transition-colors duration-300 ${bgStyle}`}>
      {/* Sidebar Navigation */}
      <aside className={`w-full md:w-64 flex flex-col border-b md:border-b-0 md:border-r shrink-0 transition-colors duration-300 ${isLight ? 'border-[#D4D4D8] bg-white' : 'border-[#2D2D30] bg-[#111113]'}`}>
        <div className={`p-6 border-b flex justify-between items-center shrink-0 ${isLight ? 'border-[#D4D4D8]' : 'border-[#2D2D30]'}`}>
          <div>
            <h1 className={`text-sm font-bold tracking-widest uppercase mb-1 underline underline-offset-4 decoration-2 ${isLight ? 'text-zinc-950 decoration-[#15803D]' : 'text-white decoration-[#32D74B]'}`}>
              {profile?.frontmatter.title || "Raonar"}
            </h1>
            <p className="text-[10px] font-mono uppercase tracking-tighter italic opacity-80">
              {profile?.frontmatter.subtitle || "Neural Engineering Lab"}
            </p>
          </div>
          {/* Theme switch button in header */}
          <button
            onClick={() => setIsLight(!isLight)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${isLight ? 'border-zinc-200 hover:bg-zinc-100 text-zinc-600' : 'border-[#2D2D30] hover:bg-white/5 text-zinc-400 hover:text-white'}`}
            title={isLight ? "Activate Dark Mode" : "Activate Light Mode"}
          >
            {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {/* Desktop Search in Sidebar */}
          <div className="px-4 mb-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 opacity-50" />
              <input
                type="text"
                placeholder={settingsFm.search_placeholder || "Query knowledge base..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-md border focus:ring-1 focus:ring-[#32D74B]/30 focus:border-[#32D74B] font-mono transition-all outline-none ${
                  isLight 
                    ? "bg-zinc-50 border-zinc-200 text-zinc-850" 
                    : "bg-[#0A0A0B]/50 border-[#2D2D30] text-zinc-200"
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2 text-[10px] opacity-60 hover:opacity-100"
                >
                  {settingsFm.search_clear || "Clear"}
                </button>
              )}
            </div>
          </div>

          <ul className="space-y-1 px-3 text-[12px] font-mono font-medium">
            {[
              { view: "home", label: settingsFm.nav_home || "HOME", icon: Home },
              { view: "about", label: settingsFm.nav_about || "ABOUT", icon: User },
              { view: "projects", label: settingsFm.nav_projects || "PROJECTS", icon: FolderCode },
              { view: "lab-notebook", label: settingsFm.nav_lab || "LAB NOTEBOOK", icon: BookOpen },
              { view: "research-notes", label: settingsFm.nav_notes || "RESEARCH NOTES", icon: Compass },
              { view: "papers", label: settingsFm.nav_papers || "PAPERS", icon: FileText },
              { view: "resources", label: settingsFm.nav_resources || "RESOURCES", icon: Layers },
              { view: "contact", label: settingsFm.nav_contact || "CONTACT", icon: Mail },
            ].map((item, index) => {
              const isActive =
                route.view === item.view ||
                (item.view === "projects" && route.view === "project-detail") ||
                (item.view === "lab-notebook" && route.view === "lab-detail") ||
                (item.view === "research-notes" && route.view === "research-detail") ||
                (item.view === "papers" && route.view === "paper-detail");

              const indexStr = String(index + 1).padStart(2, "0");

              return (
                <li key={item.view}>
                  <button
                    onClick={() => navigateTo(item.view as RouteState["view"])}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 transition-colors cursor-pointer border-l-2 ${
                      isActive
                        ? isLight
                          ? "bg-zinc-100 text-[#15803D] border-[#15803D] font-bold"
                          : "bg-white/5 text-white border-[#32D74B] font-bold"
                        : isLight
                          ? "border-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                          : "border-transparent text-[#8E9299] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="opacity-65 text-[10px]">{indexStr}</span>
                    <span className="tracking-wide">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col md:overflow-hidden">
        {/* Mobile top-bar (shown only on mobile) */}
        <div className={`flex md:hidden items-center justify-between p-4 border-b shrink-0 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#111113] border-[#2D2D30]'}`}>
          <div className={`font-mono text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-zinc-950' : 'text-white'}`}>
            {profile?.frontmatter.title || "Raonar"} / Digital Lab
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2 w-3 h-3 opacity-40" />
            <input
              type="text"
              placeholder={settingsFm.search_placeholder || "Search..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-6 pr-2 py-1 text-xs rounded border outline-none font-mono ${
                isLight 
                  ? "bg-white border-zinc-200 text-zinc-800" 
                  : "bg-[#0A0A0B]/50 border-[#2D2D30] text-zinc-200"
              }`}
            />
          </div>
        </div>

        {/* Header / Mission Statement */}
        <header className={`p-6 md:p-8 border-b shrink-0 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#0F0F11] border-[#2D2D30]'}`}>
          <p className={`text-[11px] font-mono uppercase mb-2 tracking-widest ${isLight ? 'text-[#15803D]' : 'text-[#32D74B]'}`}>
            {settingsFm.focus_label || "Active Focus"}
          </p>
          <h2 className={`text-xl sm:text-2xl md:text-3xl font-light tracking-tight leading-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
            {currentMission?.frontmatter.building || settingsFm.active_focus_fallback || "Exploring neural interfaces, biomedical signals, and embedded systems."}
          </h2>
        </header>

        {/* Global Live Search Results overlay when query active */}
        {searchQuery && (
          <div className="absolute top-16 left-0 right-0 max-w-4xl mx-auto w-full px-4 mt-2 z-50">
            <div className={`p-5 rounded-lg border shadow-2xl ${isLight ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-[#111113] border-[#2D2D30] text-zinc-200'}`}>
              <div className={`flex items-center justify-between pb-3 border-b mb-3 ${isLight ? 'border-zinc-200' : 'border-[#2D2D30]'}`}>
                <span className="text-xs font-mono opacity-60">
                  Found {filteredSearchNodes.length} {settingsFm.found_matches_label || "matches in knowledge files"}
                </span>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-mono text-[#32D74B] hover:underline cursor-pointer"
                >
                  {settingsFm.close_search_label || "Close Search Overlay"}
                </button>
              </div>
              {filteredSearchNodes.length === 0 ? (
                <div className="text-sm font-mono opacity-50 py-4">
                  {settingsFm.no_resources_label || "No matching records found."}
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2.5 pr-2">
                  {filteredSearchNodes.map((node) => (
                    <button
                      key={node.slug}
                      onClick={() => {
                        setSearchQuery("");
                        if (node.type === "project") navigateTo("project-detail", node.slug);
                        else if (node.type === "lab-notebook") navigateTo("lab-detail", node.slug);
                        else if (node.type === "paper") navigateTo("paper-detail", node.slug);
                        else if (node.type === "research-note")
                          navigateTo("research-detail", node.slug, node.topic);
                      }}
                      className={`w-full text-left p-3 rounded-md border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        isLight 
                          ? 'bg-zinc-50 border-zinc-200 hover:border-zinc-350' 
                          : 'bg-[#0A0A0B]/40 border-[#2D2D30] hover:border-zinc-700 hover:bg-zinc-900/40'
                      }`}
                    >
                      <div>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-[#32D74B]/10 text-[#32D74B] border border-[#32D74B]/10 mr-2.5">
                          {node.type}
                        </span>
                        <span className="text-sm font-medium text-white">{node.frontmatter.title}</span>
                        <p className={`text-xs mt-1 line-clamp-1 ${textSubtleStyle}`}>
                          {node.frontmatter.summary || node.content.slice(0, 100)}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono opacity-50 shrink-0">
                        {formatDate(node.frontmatter.date)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Outer Split Pane Box */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
          {/* Left Split: Core Views */}
          <section className="flex-1 overflow-y-auto p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={route.view + (route.slug || "")}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="space-y-8"
              >
              {/* ================= HOME VIEW ================= */}
              {route.view === "home" && (
                <div className="space-y-8">
                  {/* Bio Hero Board */}
                  <div className={`p-6 sm:p-8 rounded-xl border ${cardStyle} relative overflow-hidden`}>
                    <div className="relative z-10 space-y-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${isLight ? 'bg-emerald-50 text-[#15803D] border-[#15803D]/20' : 'bg-emerald-500/10 text-[#32D74B] border-emerald-500/10'} text-xs font-mono`}>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{profile?.frontmatter.role || settingsFm.active_focus_fallback || "Biomedical Signal Processing & Neural Engineering"}</span>
                      </div>
                      <h1 className={`text-3xl font-bold tracking-tight ${isLight ? 'text-zinc-950' : 'text-white'}`}>
                        {settingsFm.hero_welcome || "Welcome to the Digital Laboratory"}
                      </h1>
                      <p className={`text-[15px] leading-relaxed max-w-2xl ${textSubtleStyle}`}>
                        {profile?.frontmatter.summary || settingsFm.hero_desc_fallback || "An open-science engineering repository..."}
                      </p>
                    </div>
                    <div className={`absolute right-0 bottom-0 opacity-10 pointer-events-none select-none translate-x-12 translate-y-12 ${isLight ? 'text-[#15803D]' : 'text-[#32D74B]'}`}>
                      <Compass className="w-72 h-72" />
                    </div>
                  </div>

                  {/* Current Mission - pulled from current-mission.md */}
                  {currentMission && (
                    <div className={`p-6 rounded-xl border ${cardStyle} space-y-5`}>
                      <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-zinc-200' : 'border-[#2D2D30]'}`}>
                        <div className="flex items-center gap-2">
                          <Layers className={`w-4.5 h-4.5 ${isLight ? 'text-[#15803D]' : 'text-[#32D74B]'}`} />
                          <h2 className={`text-base font-semibold font-mono tracking-tight uppercase ${isLight ? 'text-zinc-950' : 'text-white'}`}>
                            {settingsFm.focus_label || "Active Focus"}
                          </h2>
                        </div>
                        <span className={`text-[10px] font-mono ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                          {settingsFm.last_sync_label || "Last Sync"}: {formatDate(currentMission.frontmatter.date)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-12 space-y-1">
                          <span className="text-[10px] tracking-widest text-emerald-400 font-mono uppercase font-semibold">
                            {settingsFm.active_initiative_label || "ACTIVE INITIATIVE"}
                          </span>
                          <p className="text-sm text-zinc-200 font-medium">
                            {currentMission.frontmatter.title}
                          </p>
                        </div>
                        {currentMission.frontmatter.bottleneck && (
                          <div className="md:col-span-12 space-y-1">
                            <span className="text-[10px] tracking-widest text-amber-500 font-mono uppercase font-semibold">
                              {settingsFm.current_bottleneck_label || "CURRENT BOTTLENECK"}
                            </span>
                            <p className="text-sm text-zinc-300">
                              {currentMission.frontmatter.bottleneck}
                            </p>
                          </div>
                        )}
                        {currentMission.frontmatter.milestone && (
                          <div className="md:col-span-12 space-y-1">
                            <span className="text-[10px] tracking-widest text-cyan-400 font-mono uppercase font-semibold">
                              {settingsFm.next_milestone_label || "NEXT CRITICAL MILESTONE"}
                            </span>
                            <p className="text-sm text-zinc-300">
                              {currentMission.frontmatter.milestone}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-zinc-800/50">
                        <MarkdownRenderer
                          content={currentMission.content}
                          onNavigate={(slug) => navigateTo("project-detail", slug)}
                          allSlugs={allSlugs}
                          isLight={isLight}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stats Dashboard Bento Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { label: settingsFm.stats_projects || "Active Projects", value: stats.projectsCount, icon: FolderCode, color: "text-emerald-500" },
                      { label: settingsFm.stats_papers || "Papers Read", value: stats.papersRead, icon: FileText, color: "text-cyan-400" },
                      { label: settingsFm.stats_notes || "Research Notes", value: stats.notesLog, icon: Compass, color: "text-purple-400" },
                      { label: settingsFm.stats_experiments || "Experiments Run", value: stats.totalExperiments, icon: BookOpen, color: "text-amber-500" },
                      { label: settingsFm.stats_hours || "Lab Hours", value: stats.estimatedLabHours, icon: Clock, color: "text-indigo-400" },
                    ].map((s, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border ${cardStyle} flex flex-col justify-between`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <s.icon className={`w-4 h-4 ${s.color}`} />
                        </div>
                        <div>
                          <div className="text-2xl font-bold tracking-tight text-white font-mono">
                            {s.value}
                          </div>
                          <div className="text-[10px] font-mono uppercase text-zinc-400 mt-1">
                            {s.label}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Featured Projects (2-3 cards) */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-800/50">
                      <h2 className="text-sm font-semibold font-mono tracking-tight text-white uppercase">
                        {settingsFm.featured_systems_label || "Featured Systems"}
                      </h2>
                      <button
                        onClick={() => navigateTo("projects")}
                        className="text-xs font-mono text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>{settingsFm.all_projects_label || "All projects"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getProjects()
                        .slice(0, 2)
                        .map((project) => (
                          <div
                            key={project.slug}
                            className={`p-5 rounded-xl border ${cardStyle} ${hoverCardStyle} transition-all flex flex-col justify-between gap-4`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${
                                    project.frontmatter.status === "active"
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                      : "bg-zinc-800 text-zinc-400"
                                  }`}
                                >
                                  {project.frontmatter.status}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-500">
                                  {formatDate(project.frontmatter.date)}
                                </span>
                              </div>
                              <h3 className="text-base font-bold text-white mb-2 line-clamp-1">
                                {project.frontmatter.title}
                              </h3>
                              <p className={`text-xs ${textSubtleStyle} line-clamp-2 leading-relaxed mb-4`}>
                                {project.frontmatter.summary}
                              </p>
                            </div>
                            <button
                              onClick={() => navigateTo("project-detail", project.slug)}
                              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1.5 mt-2 cursor-pointer w-fit"
                            >
                              <span>{settingsFm.examine_technical_file_label || "Examine technical file"}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Latest Lab Notebook Logs */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-800/50">
                      <h2 className="text-sm font-semibold font-mono tracking-tight text-white uppercase">
                        {settingsFm.recent_log_entries_label || "Recent Log Entries"}
                      </h2>
                      <button
                        onClick={() => navigateTo("lab-notebook")}
                        className="text-xs font-mono text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>{settingsFm.open_lab_book_label || "Open lab book"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {getLabNotebook()
                        .slice(0, 3)
                        .map((log) => (
                          <div
                            key={log.slug}
                            onClick={() => navigateTo("lab-detail", log.slug)}
                            className={`p-4 rounded-xl border ${cardStyle} ${hoverCardStyle} cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                                <span className="text-[10px] font-mono text-zinc-500">
                                  {formatDate(log.frontmatter.date)}
                                </span>
                              </div>
                              <h3 className="text-sm font-bold text-white hover:text-emerald-400 transition-colors">
                                {log.frontmatter.title}
                              </h3>
                              <p className={`text-xs ${textSubtleStyle} line-clamp-1`}>
                                {log.frontmatter.summary}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {(log.frontmatter.tags || []).slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className={`px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 text-[9px] font-mono`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= ABOUT VIEW ================= */}
              {route.view === "about" && (
                <div className="space-y-8">
                  <div className={`p-6 sm:p-8 rounded-xl border ${cardStyle} space-y-6`}>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-[#32D74B]/20 flex items-center justify-center text-[#32D74B] overflow-hidden shrink-0">
                        {profile?.frontmatter.avatarUrl ? (
                          <img
                            src={profile.frontmatter.avatarUrl.startsWith("http") ? profile.frontmatter.avatarUrl : "/" + profile.frontmatter.avatarUrl}
                            alt={profile.frontmatter.title || "Profile"}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-8 h-8" />
                        )}
                      </div>
                      <div>
                        <h1 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                          {profile?.frontmatter.title || "Raonar"}
                        </h1>
                        <p className={`text-sm font-mono ${isLight ? 'text-[#15803D]' : 'text-[#32D74B]'}`}>
                          {profile?.frontmatter.role || "Neural Integration Specialist & Electrical Engineer"}
                        </p>
                      </div>
                    </div>

                    {profile ? (
                      <div className={`prose max-w-none ${isLight ? 'text-zinc-800' : 'text-zinc-300'}`}>
                        <MarkdownRenderer
                          content={profile.content}
                          onNavigate={(target) => {
                            const targetNode = getNodeBySlug(target);
                            if (targetNode) {
                              if (targetNode.type === "project")
                                navigateTo("project-detail", targetNode.slug);
                              else if (targetNode.type === "lab-notebook")
                                navigateTo("lab-detail", targetNode.slug);
                              else if (targetNode.type === "paper")
                                navigateTo("paper-detail", targetNode.slug);
                              else if (targetNode.type === "research-note")
                                navigateTo("research-detail", targetNode.slug, targetNode.topic);
                            }
                          }}
                          allSlugs={allSlugs}
                          isLight={isLight}
                        />
                      </div>
                    ) : (
                      <div className="text-sm font-mono opacity-50 py-4">
                        {settingsFm.profile_not_found_label || "Profile configuration not found."}
                      </div>
                    )}

                    {/* Dynamic Timeline - Professional Experience */}
                    {experienceList.length > 0 && (
                      <div className="pt-6 border-t border-zinc-850">
                        <h3 className="text-sm font-semibold font-mono tracking-tight text-white uppercase mb-4">
                          {settingsFm.experience_title_label || "Professional Experience"}
                        </h3>
                        <div className="space-y-6">
                          {experienceList.map((exp) => (
                            <div key={exp.slug} className={`p-5 rounded-xl border ${cardStyle} relative`}>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                <div>
                                  <h4 className="text-sm font-bold text-white">{exp.frontmatter.title}</h4>
                                  <p className={`text-xs font-mono ${isLight ? 'text-[#15803D]' : 'text-[#32D74B]'}`}>
                                    {exp.frontmatter.organization} {exp.frontmatter.location ? `• ${exp.frontmatter.location}` : ''}
                                  </p>
                                </div>
                                <div className="text-[10px] font-mono text-zinc-500">
                                  {formatDate(exp.frontmatter.date)} — {exp.frontmatter.endDate || "Present"}
                                </div>
                              </div>
                              <div className={`prose max-w-none text-xs leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                                <MarkdownRenderer
                                  content={exp.content}
                                  onNavigate={navigateTo}
                                  allSlugs={allSlugs}
                                  isLight={isLight}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dynamic Skills Categories */}
                    {skillsCategories.length > 0 && (
                      <div className="pt-6 border-t border-zinc-850">
                        <h3 className="text-sm font-semibold font-mono tracking-tight text-white uppercase mb-4">
                          {skillsNode?.frontmatter.title || settingsFm.tenets_title_label || "Structured Skills Index"}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {skillsCategories.map((skill: any, idx: number) => (
                            <div key={idx} className={`p-4 rounded-lg border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/40 border-zinc-850'}`}>
                              <span className={`text-xs font-bold font-mono tracking-wide uppercase ${isLight ? 'text-[#15803D]' : 'text-[#32D74B]'}`}>
                                {skill.name}
                              </span>
                              <ul className="mt-2.5 space-y-1.5">
                                {(skill.items || []).map((item: string) => (
                                  <li key={item} className="text-xs text-zinc-300 flex items-center gap-1.5">
                                    <ChevronRight className={`w-3 h-3 ${isLight ? 'text-[#15803D]' : 'text-[#32D74B]'} shrink-0`} />
                                    <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ================= PROJECTS LIST VIEW ================= */}
              {route.view === "projects" && (
                <div className="space-y-6">
                  <div className={`pb-4 border-b ${isLight ? 'border-zinc-200' : 'border-zinc-800/50'}`}>
                    <h1 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-zinc-950' : 'text-white'}`}>
                      {settingsFm.project_list_title || "Active Technical Projects"}
                    </h1>
                    <p className={`text-sm ${textSubtleStyle} mt-1.5`}>
                      {settingsFm.project_list_desc || "Fully documented hardware-software systems..."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {getProjects().map((project) => (
                      <div
                        key={project.slug}
                        className={`p-6 rounded-xl border ${cardStyle} ${hoverCardStyle} transition-all flex flex-col justify-between gap-4`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${
                                project.frontmatter.status === "active" || project.frontmatter.status === "in-progress"
                                  ? isLight 
                                    ? "bg-emerald-50 text-[#15803D] border border-emerald-200" 
                                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : isLight 
                                    ? "bg-zinc-100 text-zinc-600 border border-zinc-200" 
                                    : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50"
                              }`}
                            >
                              {project.frontmatter.status}
                            </span>
                            <span className={`text-xs font-mono ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
                              {formatDate(project.frontmatter.date)}
                            </span>
                          </div>
                          <h2 className={`text-lg font-bold transition-colors ${isLight ? 'text-zinc-900 hover:text-[#15803D]' : 'text-white hover:text-emerald-400'}`}>
                            {project.frontmatter.title}
                          </h2>
                          <p className={`text-sm ${textSubtleStyle} leading-relaxed`}>
                            {project.frontmatter.summary}
                          </p>
                        </div>

                        <div className={`flex flex-wrap items-center justify-between gap-4 pt-3 border-t ${isLight ? 'border-zinc-100' : 'border-zinc-900'}`}>
                          <div className="flex flex-wrap gap-1">
                            {(project.frontmatter.tags || []).map((tag) => (
                              <span
                                key={tag}
                                className={`px-2 py-0.5 rounded border text-[10px] font-mono ${isLight ? 'bg-zinc-50 text-zinc-600 border-zinc-200' : 'bg-zinc-900 text-zinc-400 border-zinc-800'}`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <button
                            onClick={() => navigateTo("project-detail", project.slug)}
                            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>{settingsFm.read_project_wiki_label || "Read project wiki"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= PROJECT DETAIL VIEW ================= */}
              {route.view === "project-detail" && (
                <div className="space-y-6">
                  {(() => {
                    const project = getNodeBySlug(route.slug || "");
                    if (!project) return <div>{settingsFm.project_not_found_label || "Project not found."}</div>;

                    const backlinks = getBacklinks(project.slug);

                    return (
                      <div className="space-y-6">
                        {/* Header card */}
                        <div className={`p-6 rounded-xl border ${cardStyle} space-y-4`}>
                          <button
                            onClick={() => navigateTo("projects")}
                            className="text-xs font-mono text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            {settingsFm.back_to_projects_label || "← Back to projects"}
                          </button>

                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {project.frontmatter.status}
                              </span>
                              <span className="text-xs font-mono text-zinc-500">
                                {settingsFm.date_logged_label || "Date Logged:"} {formatDate(project.frontmatter.date)}
                              </span>
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-white">
                              {project.frontmatter.title}
                            </h1>
                          </div>

                          <p className={`text-sm leading-relaxed ${textSubtleStyle}`}>
                            {project.frontmatter.summary}
                          </p>

                          {/* Dynamic Timeline / Status Field block */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-900">
                            {project.frontmatter.bottleneck && (
                              <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 text-xs">
                                <span className="block font-mono text-amber-500 uppercase font-semibold tracking-wide">
                                  {settingsFm.current_bottleneck_label || "Current Bottleneck"}
                                </span>
                                <p className="mt-1 text-zinc-300">{project.frontmatter.bottleneck}</p>
                              </div>
                            )}
                            {project.frontmatter.milestone && (
                              <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800 text-xs">
                                <span className="block font-mono text-cyan-400 uppercase font-semibold tracking-wide">
                                  {settingsFm.next_milestone_label || "Next Milestone"}
                                </span>
                                <p className="mt-1 text-zinc-300">{project.frontmatter.milestone}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Article body */}
                        <div className={`p-6 sm:p-8 rounded-xl border ${cardStyle}`}>
                          <MarkdownRenderer
                            content={project.content}
                            onNavigate={(target) => {
                              const targetNode = getNodeBySlug(target);
                              if (targetNode) {
                                  if (targetNode.type === "project")
                                    navigateTo("project-detail", targetNode.slug);
                                  else if (targetNode.type === "lab-notebook")
                                    navigateTo("lab-detail", targetNode.slug);
                                  else if (targetNode.type === "paper")
                                    navigateTo("paper-detail", targetNode.slug);
                                  else if (targetNode.type === "research-note")
                                    navigateTo("research-detail", targetNode.slug, targetNode.topic);
                              }
                            }}
                            allSlugs={allSlugs}
                            isLight={isLight}
                          />
                        </div>

                        {/* Link Backlinks */}
                        {backlinks.length > 0 && (
                          <div className={`p-6 rounded-xl border ${cardStyle} space-y-3.5`}>
                            <h3 className="text-xs font-semibold font-mono tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
                              <Link2 className="w-4 h-4" />
                              <span>{settingsFm.referenced_by_label || "Referenced By (Backlinks)"}</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {backlinks.map((node) => (
                                <button
                                  key={node.slug}
                                  onClick={() => {
                                    if (node.type === "project")
                                      navigateTo("project-detail", node.slug);
                                    else if (node.type === "lab-notebook")
                                      navigateTo("lab-detail", node.slug);
                                    else if (node.type === "paper")
                                      navigateTo("paper-detail", node.slug);
                                    else if (node.type === "research-note")
                                      navigateTo("research-detail", node.slug, node.topic);
                                  }}
                                  className="text-left p-3 rounded bg-zinc-950/40 border border-zinc-850 hover:border-zinc-700 hover:bg-zinc-900/30 transition-all text-xs cursor-pointer flex flex-col justify-between"
                                >
                                  <span className="font-medium text-white line-clamp-1">
                                    {node.frontmatter.title}
                                  </span>
                                  <span className="text-[9px] font-mono uppercase text-zinc-500 mt-1">
                                    {node.type} • {formatDate(node.frontmatter.date)}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ================= LAB NOTEBOOK VIEW ================= */}
              {route.view === "lab-notebook" && (
                <div className="space-y-6">
                  <div className={`pb-4 border-b ${isLight ? 'border-zinc-200' : 'border-zinc-800/50'} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                    <div>
                      <h1 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-zinc-950' : 'text-white'}`}>
                        {settingsFm.lab_list_title || "Living Lab Notebook"}
                      </h1>
                      <p className={`text-sm ${textSubtleStyle} mt-1.5`}>
                        {settingsFm.lab_list_desc || "Chronological record of lab measurements..."}
                      </p>
                    </div>

                    {/* Weekly digest view toggle */}
                    <button
                      onClick={() => setWeeklyDigestMode(!weeklyDigestMode)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all cursor-pointer ${isLight ? 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900' : 'text-zinc-300 hover:text-white border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50'}`}
                    >
                      {weeklyDigestMode ? (settingsFm.weekly_digest_toggle_off || "Show Chronological Feed") : (settingsFm.weekly_digest_toggle_on || "Show Weekly Digest View")}
                    </button>
                  </div>

                  {weeklyDigestMode ? (
                    /* Weekly digest grouping list */
                    <div className="space-y-6">
                      {(() => {
                        const getWeekAndYear = (dateStr: string) => {
                          const date = new Date(dateStr);
                          const year = date.getFullYear();
                          const target = new Date(date.valueOf());
                          const dayNr = (date.getDay() + 6) % 7;
                          target.setDate(target.getDate() - dayNr + 3);
                          const firstThursday = target.valueOf();
                          target.setMonth(0, 1);
                          if (target.getDay() !== 4) {
                            target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
                          }
                          const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
                          return { year, week: weekNum };
                        };

                        const logs = getLabNotebook();
                        const groups: Record<string, typeof logs> = {};
                        for (const log of logs) {
                          const { year, week } = getWeekAndYear(log.frontmatter.date);
                          const key = `Week ${week}, ${year}`;
                          if (!groups[key]) groups[key] = [];
                          groups[key].push(log);
                        }

                        return Object.entries(groups).map(([weekLabel, groupLogs]) => (
                          <div key={weekLabel} className={`p-5 rounded-xl border ${cardStyle} space-y-4`}>
                            <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-800">
                              <Calendar className="w-4 h-4 text-amber-500" />
                              <h3 className="text-sm font-bold font-mono tracking-tight text-white uppercase">
                                {weekLabel} {settingsFm.week_digest_label || "Digest"}
                              </h3>
                              <span className="text-[10px] font-mono text-zinc-500">
                                ({groupLogs.length} {groupLogs.length === 1 ? (settingsFm.entry_logged_label || "entry logged") : (settingsFm.entries_logged_label || "entries logged")})
                              </span>
                            </div>

                            <div className="space-y-3">
                              {groupLogs.map((log) => (
                                <div
                                  key={log.slug}
                                  onClick={() => navigateTo("lab-detail", log.slug)}
                                  className="p-3.5 rounded border border-zinc-800/65 bg-zinc-950/20 hover:border-zinc-700 hover:bg-zinc-950/40 cursor-pointer transition-all flex justify-between items-center"
                                >
                                  <div>
                                    <h4 className="text-sm font-semibold text-white hover:text-emerald-400 transition-colors">
                                      {log.frontmatter.title}
                                    </h4>
                                    <p className={`text-xs ${textSubtleStyle} mt-1 line-clamp-1`}>
                                      {log.frontmatter.summary}
                                    </p>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
                                </div>
                              ))}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  ) : (
                    /* General chronological feed */
                    <div className="space-y-4">
                      {getLabNotebook().map((log) => (
                        <div
                          key={log.slug}
                          className={`p-6 rounded-xl border ${cardStyle} ${hoverCardStyle} transition-all space-y-3`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                              <span className="text-xs font-mono text-zinc-500">
                                {formatDate(log.frontmatter.date)}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {(log.frontmatter.tags || []).slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 text-[9px] font-mono"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          <h2 className="text-base font-bold text-white hover:text-emerald-400 transition-colors">
                            {log.frontmatter.title}
                          </h2>

                          <p className={`text-sm ${textSubtleStyle} leading-relaxed`}>
                            {log.frontmatter.summary}
                          </p>

                          <div className="pt-2">
                            <button
                              onClick={() => navigateTo("lab-detail", log.slug)}
                              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>{settingsFm.read_entry_data_label || "Read entry data"}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ================= LAB DETAIL VIEW ================= */}
              {route.view === "lab-detail" && (
                <div className="space-y-6">
                  {(() => {
                    const log = getNodeBySlug(route.slug || "");
                    if (!log) return <div>{settingsFm.notebook_not_found_label || "Notebook entry not found."}</div>;

                    const backlinks = getBacklinks(log.slug);

                    return (
                      <div className="space-y-6">
                        {/* Header block */}
                        <div className={`p-6 rounded-xl border ${cardStyle} space-y-4`}>
                          <button
                            onClick={() => navigateTo("lab-notebook")}
                            className="text-xs font-mono text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            {settingsFm.back_to_lab_label || "← Back to lab book"}
                          </button>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                              <span className="text-xs font-mono text-zinc-500">
                                {settingsFm.logged_label || "Logged:"} {formatDate(log.frontmatter.date)}
                              </span>
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-white">
                              {log.frontmatter.title}
                            </h1>
                          </div>

                          <p className={`text-sm leading-relaxed ${textSubtleStyle}`}>
                            {log.frontmatter.summary}
                          </p>
                        </div>

                        {/* Body content */}
                        <div className={`p-6 sm:p-8 rounded-xl border ${cardStyle}`}>
                          <MarkdownRenderer
                            content={log.content}
                            onNavigate={(target) => {
                              const targetNode = getNodeBySlug(target);
                              if (targetNode) {
                                if (targetNode.type === "project")
                                  navigateTo("project-detail", targetNode.slug);
                                else if (targetNode.type === "lab-notebook")
                                  navigateTo("lab-detail", targetNode.slug);
                                else if (targetNode.type === "paper")
                                  navigateTo("paper-detail", targetNode.slug);
                                else if (targetNode.type === "research-note")
                                  navigateTo("research-detail", targetNode.slug, targetNode.topic);
                              }
                            }}
                            allSlugs={allSlugs}
                            isLight={isLight}
                          />
                        </div>

                        {/* Backlinks */}
                        {backlinks.length > 0 && (
                          <div className={`p-6 rounded-xl border ${cardStyle} space-y-3.5`}>
                            <h3 className="text-xs font-semibold font-mono tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
                              <Link2 className="w-4 h-4" />
                              <span>{settingsFm.referenced_by_label || "Referenced By (Backlinks)"}</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {backlinks.map((node) => (
                                <button
                                  key={node.slug}
                                  onClick={() => {
                                    if (node.type === "project")
                                      navigateTo("project-detail", node.slug);
                                    else if (node.type === "lab-notebook")
                                      navigateTo("lab-detail", node.slug);
                                    else if (node.type === "paper")
                                      navigateTo("paper-detail", node.slug);
                                    else if (node.type === "research-note")
                                      navigateTo("research-detail", node.slug, node.topic);
                                  }}
                                  className="text-left p-3 rounded bg-zinc-950/40 border border-zinc-850 hover:border-zinc-700 hover:bg-zinc-900/30 transition-all text-xs cursor-pointer flex flex-col justify-between"
                                >
                                  <span className="font-medium text-white line-clamp-1">
                                    {node.frontmatter.title}
                                  </span>
                                  <span className="text-[9px] font-mono uppercase text-zinc-500 mt-1">
                                    {node.type} • {formatDate(node.frontmatter.date)}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ================= RESEARCH NOTES VIEW ================= */}
              {route.view === "research-notes" && (
                <div className="space-y-6">
                  <div className={`pb-4 border-b ${isLight ? 'border-zinc-200' : 'border-zinc-800/50'}`}>
                    <h1 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-zinc-950' : 'text-white'}`}>
                      {settingsFm.research_list_title || "Structured Research Notes"}
                    </h1>
                    <p className={`text-sm ${textSubtleStyle} mt-1.5`}>
                      {settingsFm.research_list_desc || "Synthesized topic folders containing specs..."}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {Object.entries(getResearchNotesByTopic()).map(([topicLabel, notes]) => (
                      <div key={topicLabel} className={`p-5 rounded-xl border ${cardStyle} space-y-4`}>
                        <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-800">
                          <Layers className="w-4 h-4 text-purple-400" />
                          <h3 className="text-sm font-bold font-mono tracking-tight text-white uppercase">
                            {settingsFm.folder_label || "Folder:"} {topicLabel}
                          </h3>
                          <span className="text-[10px] font-mono text-zinc-500">
                            ({notes.length} {settingsFm.notes_logged_label || "notes logged"})
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {notes.map((note) => (
                            <div
                              key={note.slug}
                              className="p-4 rounded border border-zinc-800/60 bg-zinc-950/20 hover:border-zinc-700 hover:bg-zinc-950/40 transition-all flex flex-col justify-between gap-3"
                            >
                              <div>
                                <h4 className="text-sm font-bold text-white mb-1">{note.frontmatter.title}</h4>
                                <p className={`text-xs ${textSubtleStyle} line-clamp-2 leading-relaxed`}>
                                  {note.frontmatter.summary}
                                </p>
                              </div>
                              <button
                                onClick={() => navigateTo("research-detail", note.slug, note.topic)}
                                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer w-fit"
                              >
                                <span>{settingsFm.inspect_topic_notes_label || "Inspect topic notes"}</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= RESEARCH DETAIL VIEW ================= */}
              {route.view === "research-detail" && (
                <div className="space-y-6">
                  {(() => {
                    const note = getNodeBySlug(route.slug || "");
                    if (!note) return <div>{settingsFm.note_not_found_label || "Research note not found."}</div>;

                    const backlinks = getBacklinks(note.slug);

                    return (
                      <div className="space-y-6">
                        {/* Header panel */}
                        <div className={`p-6 rounded-xl border ${cardStyle} space-y-4`}>
                          <button
                            onClick={() => navigateTo("research-notes")}
                            className="text-xs font-mono text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            {settingsFm.back_to_research_label || "← Back to topic catalog"}
                          </button>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Layers className="w-3.5 h-3.5 text-purple-400" />
                              <span className="text-xs font-mono text-zinc-500">
                                {settingsFm.folder_label || "Folder:"} {note.frontmatter.topic || note.topic || "General"} • {settingsFm.logged_label || "Logged:"} {formatDate(note.frontmatter.date)}
                              </span>
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-white">
                              {note.frontmatter.title}
                            </h1>
                          </div>

                          <p className={`text-sm leading-relaxed ${textSubtleStyle}`}>
                            {note.frontmatter.summary}
                          </p>
                        </div>

                        {/* Core markdown body */}
                        <div className={`p-6 sm:p-8 rounded-xl border ${cardStyle}`}>
                          <MarkdownRenderer
                            content={note.content}
                            onNavigate={(target) => {
                              const targetNode = getNodeBySlug(target);
                              if (targetNode) {
                                if (targetNode.type === "project")
                                  navigateTo("project-detail", targetNode.slug);
                                else if (targetNode.type === "lab-notebook")
                                  navigateTo("lab-detail", targetNode.slug);
                                else if (targetNode.type === "paper")
                                  navigateTo("paper-detail", targetNode.slug);
                                else if (targetNode.type === "research-note")
                                  navigateTo("research-detail", targetNode.slug, targetNode.topic);
                              }
                            }}
                            allSlugs={allSlugs}
                            isLight={isLight}
                          />
                        </div>

                        {/* Backlinks */}
                        {backlinks.length > 0 && (
                          <div className={`p-6 rounded-xl border ${cardStyle} space-y-3.5`}>
                            <h3 className="text-xs font-semibold font-mono tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
                              <Link2 className="w-4 h-4" />
                              <span>{settingsFm.referenced_by_label || "Referenced By (Backlinks)"}</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {backlinks.map((node) => (
                                <button
                                  key={node.slug}
                                  onClick={() => {
                                    if (node.type === "project")
                                      navigateTo("project-detail", node.slug);
                                    else if (node.type === "lab-notebook")
                                      navigateTo("lab-detail", node.slug);
                                    else if (node.type === "paper")
                                      navigateTo("paper-detail", node.slug);
                                    else if (node.type === "research-note")
                                      navigateTo("research-detail", node.slug, node.topic);
                                  }}
                                  className="text-left p-3 rounded bg-zinc-950/40 border border-zinc-850 hover:border-zinc-700 hover:bg-zinc-900/30 transition-all text-xs cursor-pointer flex flex-col justify-between"
                                >
                                  <span className="font-medium text-white line-clamp-1">
                                    {node.frontmatter.title}
                                  </span>
                                  <span className="text-[9px] font-mono uppercase text-zinc-500 mt-1">
                                    {node.type} • {formatDate(node.frontmatter.date)}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ================= PAPERS LIST VIEW ================= */}
              {route.view === "papers" && (
                <div className="space-y-6">
                  <div className={`pb-4 border-b ${isLight ? 'border-zinc-200' : 'border-zinc-800/50'}`}>
                    <h1 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-zinc-950' : 'text-white'}`}>
                      {settingsFm.paper_list_title || "Reviewed Scientific Literature"}
                    </h1>
                    <p className={`text-sm ${textSubtleStyle} mt-1.5`}>
                      {settingsFm.paper_list_desc || "Peer-reviewed manuscripts summarized..."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {getPapers().map((paper) => (
                      <div
                        key={paper.slug}
                        className={`p-6 rounded-xl border ${cardStyle} ${hoverCardStyle} transition-all flex flex-col sm:flex-row gap-4 items-start justify-between`}
                      >
                        <div className="space-y-1.5 max-w-xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-mono">
                              {settingsFm.rating_label || "RATING:"} {paper.frontmatter.rating || "N/A"}
                            </span>
                            <span className="text-xs font-mono text-zinc-500">
                              {settingsFm.reviewed_label || "Reviewed:"} {formatDate(paper.frontmatter.date)}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-white hover:text-emerald-400 transition-colors">
                            {paper.frontmatter.title}
                          </h3>
                          <p className="text-xs font-mono text-emerald-400/90">
                            {paper.frontmatter.author}
                          </p>
                          <p className={`text-xs ${textSubtleStyle} line-clamp-2 mt-1 leading-normal`}>
                            {paper.frontmatter.summary}
                          </p>
                        </div>

                        <button
                          onClick={() => navigateTo("paper-detail", paper.slug)}
                          className="text-xs font-mono text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <span>{settingsFm.examine_review_label || "Examine review"}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= PAPER DETAIL VIEW ================= */}
              {route.view === "paper-detail" && (
                <div className="space-y-6">
                  {(() => {
                    const paper = getNodeBySlug(route.slug || "");
                    if (!paper) return <div>{settingsFm.paper_not_found_label || "Paper review not found."}</div>;

                    const backlinks = getBacklinks(paper.slug);

                    return (
                      <div className="space-y-6">
                        {/* Header panel */}
                        <div className={`p-6 rounded-xl border ${cardStyle} space-y-4`}>
                          <button
                            onClick={() => navigateTo("papers")}
                            className="text-xs font-mono text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            {settingsFm.back_to_papers_label || "← Back to literature feed"}
                          </button>

                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-mono">
                                  {settingsFm.literature_review_label || "LITERATURE REVIEW"}
                                </span>
                                <span className="text-xs font-mono text-zinc-500">
                                  {settingsFm.date_analyzed_label || "Date Analyzed:"} {formatDate(paper.frontmatter.date)}
                                </span>
                              </div>
                              <div className="text-xs font-mono text-emerald-400">
                                {settingsFm.personal_rating_label || "Personal Rating:"} {paper.frontmatter.rating}
                              </div>
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-white">
                              {paper.frontmatter.title}
                            </h1>
                            <p className="text-sm font-mono text-zinc-300">
                              {settingsFm.authors_source_label || "Authors/Source:"} {paper.frontmatter.author}
                            </p>
                          </div>

                          <p className={`text-sm leading-relaxed ${textSubtleStyle}`}>
                            {paper.frontmatter.summary}
                          </p>
                        </div>

                        {/* Core markdown body */}
                        <div className={`p-6 sm:p-8 rounded-xl border ${cardStyle}`}>
                          <MarkdownRenderer
                            content={paper.content}
                            onNavigate={(target) => {
                              const targetNode = getNodeBySlug(target);
                              if (targetNode) {
                                if (targetNode.type === "project")
                                  navigateTo("project-detail", targetNode.slug);
                                else if (targetNode.type === "lab-notebook")
                                  navigateTo("lab-detail", targetNode.slug);
                                else if (targetNode.type === "paper")
                                  navigateTo("paper-detail", targetNode.slug);
                                else if (targetNode.type === "research-note")
                                  navigateTo("research-detail", targetNode.slug, targetNode.topic);
                              }
                            }}
                            allSlugs={allSlugs}
                            isLight={isLight}
                          />
                        </div>

                        {/* Backlinks */}
                        {backlinks.length > 0 && (
                          <div className={`p-6 rounded-xl border ${cardStyle} space-y-3.5`}>
                            <h3 className="text-xs font-semibold font-mono tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
                              <Link2 className="w-4 h-4" />
                              <span>{settingsFm.referenced_by_label || "Referenced By (Backlinks)"}</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {backlinks.map((node) => (
                                <button
                                  key={node.slug}
                                  onClick={() => {
                                    if (node.type === "project")
                                      navigateTo("project-detail", node.slug);
                                    else if (node.type === "lab-notebook")
                                      navigateTo("lab-detail", node.slug);
                                    else if (node.type === "paper")
                                      navigateTo("paper-detail", node.slug);
                                    else if (node.type === "research-note")
                                      navigateTo("research-detail", node.slug, node.topic);
                                  }}
                                  className="text-left p-3 rounded bg-zinc-950/40 border border-zinc-850 hover:border-zinc-700 hover:bg-zinc-900/30 transition-all text-xs cursor-pointer flex flex-col justify-between"
                                >
                                  <span className="font-medium text-white line-clamp-1">
                                    {node.frontmatter.title}
                                  </span>
                                  <span className="text-[9px] font-mono uppercase text-zinc-500 mt-1">
                                    {node.type} • {formatDate(node.frontmatter.date)}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ================= RESOURCES VIEW ================= */}
              {route.view === "resources" && (
                <div className="space-y-6">
                  {(() => {
                    const resourceNode = getResources()[0]; // Standard main resource file
                    if (!resourceNode) return <div>{settingsFm.no_resources_label || "No resources indexed."}</div>;

                    return (
                      <div className="space-y-6">
                        <div className={`pb-4 border-b ${isLight ? 'border-zinc-200' : 'border-zinc-800/50'}`}>
                          <h1 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-zinc-950' : 'text-white'}`}>
                            {resourceNode.frontmatter.title}
                          </h1>
                          <p className={`text-sm ${textSubtleStyle} mt-1.5`}>
                            {resourceNode.frontmatter.summary}
                          </p>
                        </div>

                        <div className={`p-6 sm:p-8 rounded-xl border ${cardStyle}`}>
                          <MarkdownRenderer
                            content={resourceNode.content}
                            onNavigate={(target) => {
                              const targetNode = getNodeBySlug(target);
                              if (targetNode) {
                                if (targetNode.type === "project")
                                  navigateTo("project-detail", targetNode.slug);
                                else if (targetNode.type === "lab-notebook")
                                  navigateTo("lab-detail", targetNode.slug);
                                else if (targetNode.type === "paper")
                                  navigateTo("paper-detail", targetNode.slug);
                                else if (targetNode.type === "research-note")
                                  navigateTo("research-detail", targetNode.slug, targetNode.topic);
                              }
                            }}
                            allSlugs={allSlugs}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ================= CONTACT VIEW ================= */}
              {route.view === "contact" && (
                <div className="space-y-6">
                  <div className={`p-6 sm:p-8 rounded-xl border ${cardStyle} space-y-6`}>
                    <div>
                      <h1 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-zinc-950' : 'text-white'}`}>
                        {settingsFm.contact_title || "Let's Collaborate"}
                      </h1>
                      <p className={`text-sm ${textSubtleStyle} mt-1.5`}>
                        {settingsFm.contact_desc || "Get in touch below."}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        {
                          title: settingsFm.institutional_email_label || "Institutional Email",
                          desc: profile?.frontmatter.email || "raonar@example.com",
                          href: `mailto:${profile?.frontmatter.email || "raonar@example.com"}`,
                          action: settingsFm.institutional_email_desc || "Send electronic mail",
                        },
                        {
                          title: settingsFm.github_repo_label || "GitHub Repository",
                          desc: profile?.frontmatter.github ? profile.frontmatter.github.replace(/^https?:\/\//, "") : "github.com/raonar",
                          href: profile?.frontmatter.github || "https://github.com/raonar",
                          action: settingsFm.github_repo_desc || "Review firmware & CAD files",
                        },
                        {
                          title: settingsFm.linkedin_profile_label || "LinkedIn Profile",
                          desc: profile?.frontmatter.linkedin ? profile.frontmatter.linkedin.replace(/^https?:\/\//, "") : "linkedin.com/in/raonar",
                          href: profile?.frontmatter.linkedin || "https://linkedin.com",
                          action: settingsFm.linkedin_profile_desc || "View professional history",
                        },
                        {
                          title: settingsFm.google_scholar_label || "Google Scholar",
                          desc: profile?.frontmatter.scholar ? profile.frontmatter.scholar.replace(/^https?:\/\//, "") : "scholar.google.com/raonar",
                          href: profile?.frontmatter.scholar || "https://scholar.google.com",
                          action: settingsFm.google_scholar_desc || "Track publication citations",
                        },
                      ].map((link, idx) => (
                        <a
                          key={idx}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className={`p-5 rounded-lg border transition-all group block text-left ${isLight ? 'border-zinc-200 bg-zinc-50 hover:border-[#15803D]/40 hover:bg-zinc-100' : 'border-zinc-800/80 bg-zinc-900/20 hover:border-[#32D74B]/40 hover:bg-zinc-900/40'}`}
                        >
                          <span className={`block text-[10px] tracking-wider font-mono uppercase ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
                            {link.title}
                          </span>
                          <span className={`block text-sm font-semibold mt-1.5 transition-colors ${isLight ? 'text-zinc-900 group-hover:text-[#15803D]' : 'text-white group-hover:text-[#32D74B]'}`}>
                            {link.desc}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-mono mt-3 hover:underline ${isLight ? 'text-[#15803D]' : 'text-[#32D74B] group-hover:text-emerald-300'}`}>
                            <span>{link.action}</span>
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              </motion.div>
            </AnimatePresence>
          </section>

          {/* Right Split: Workspace Options + Interactive Graph + Footnotes */}
          <section className={`w-full md:w-80 shrink-0 border-t md:border-t-0 md:border-l flex flex-col overflow-y-auto p-6 space-y-6 ${isLight ? 'bg-zinc-50 border-[#D4D4D8]' : 'bg-[#0A0A0B] border-[#2D2D30]'}`}>
            {/* Information / Toggle bar */}
            <div className={`p-4 rounded-xl border ${cardStyle} space-y-3`}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-mono font-bold uppercase ${isLight ? 'text-zinc-800' : 'text-zinc-300'}`}>
                  {settingsFm.sidebar_right_title || "Workspace Options"}
                </span>
                <button
                  onClick={() => setShowGraph(!showGraph)}
                  className="text-[10px] font-mono text-[#32D74B] hover:underline cursor-pointer"
                >
                  {showGraph ? (settingsFm.graph_toggle_min || "Minimize Graph") : (settingsFm.graph_toggle_max || "Maximize Graph")}
                </button>
              </div>

              <div className={`text-xs leading-relaxed ${textSubtleStyle}`}>
                {settingsFm.sidebar_right_desc || "Every research note, lab log..."}
              </div>
            </div>

            {/* Toggleable Knowledge Graph View */}
            {showGraph && (
              <div className="h-[380px] shrink-0">
                <KnowledgeGraph
                  onNodeClick={(slug) => {
                    const node = getNodeBySlug(slug);
                    if (node) {
                      if (node.type === "project") navigateTo("project-detail", node.slug);
                      else if (node.type === "lab-notebook") navigateTo("lab-detail", node.slug);
                      else if (node.type === "paper") navigateTo("paper-detail", node.slug);
                      else if (node.type === "research-note")
                        navigateTo("research-detail", node.slug, node.topic);
                    }
                  }}
                  activeSlug={route.slug}
                />
              </div>
            )}

            {/* Technical Footnote Credentials */}
            <div className={`text-[10px] font-mono space-y-1.5 pt-4 border-t shrink-0 ${isLight ? 'border-zinc-200 text-zinc-500' : 'border-[#2D2D30] text-[#8E9299]'}`}>
              <div>© 2026 {profile?.frontmatter.title || "Raonar"}. {settingsFm.footer_license || "CC BY-NC-SA 4.0"}.</div>
              <div>{settingsFm.footer_domain_label || "Domain:"} <span className="text-[#32D74B] hover:underline cursor-pointer">{profile?.frontmatter.domain || "raonar.com"}</span></div>
              <div>{settingsFm.footer_source || "Source: Obsidian Git Sync Pipeline"}</div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
