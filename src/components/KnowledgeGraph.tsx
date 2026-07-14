/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from "react";
import { GraphNode, GraphLink, getKnowledgeGraph } from "../lib/content";
import { Network, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface KnowledgeGraphProps {
  onNodeClick: (slug: string) => void;
  activeSlug?: string;
}

interface PhysicsNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function KnowledgeGraph({ onNodeClick, activeSlug }: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [nodes, setNodes] = useState<PhysicsNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Initialize and run simple physics simulation
  useEffect(() => {
    const rawGraph = getKnowledgeGraph();
    const w = containerRef.current?.clientWidth || 600;
    const h = containerRef.current?.clientHeight || 400;
    setDimensions({ width: w, height: h });

    // Initialize nodes with random position near center
    const initialNodes: PhysicsNode[] = rawGraph.nodes.map((node) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 50 + Math.random() * 100;
      return {
        ...node,
        x: w / 2 + Math.cos(angle) * radius,
        y: h / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
      };
    });

    setLinks(rawGraph.links);

    // Force-directed layout physics parameters
    const kRepulsion = 1200; // Force repelling nodes
    const kAttraction = 0.06; // Spring constant
    const gravity = 0.02; // Pull to center
    const friction = 0.85; // Velocity damping
    const restLength = 100; // Ideal link length

    let simulationNodes = [...initialNodes];

    // Run 150 iterations of layout physics synchronously for a stable starting layout,
    // then animate active adjustments in requestAnimationFrame
    for (let iter = 0; iter < 180; iter++) {
      // 1. Repulsion force between all nodes (Coulomb's Law)
      for (let i = 0; i < simulationNodes.length; i++) {
        const n1 = simulationNodes[i];
        for (let j = i + 1; j < simulationNodes.length; j++) {
          const n2 = simulationNodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy + 0.1;
          const dist = Math.sqrt(distSq);

          if (dist < 300) {
            const force = kRepulsion / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            n1.vx -= fx;
            n1.vy -= fy;
            n2.vx += fx;
            n2.vy += fy;
          }
        }
      }

      // 2. Attraction force along links (Hooke's Law)
      for (const link of rawGraph.links) {
        const sourceNode = simulationNodes.find((n) => n.id === link.source);
        const targetNode = simulationNodes.find((n) => n.id === link.target);

        if (sourceNode && targetNode) {
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
          const displacement = dist - restLength;
          const force = displacement * kAttraction;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          sourceNode.vx += fx;
          sourceNode.vy += fy;
          targetNode.vx -= fx;
          targetNode.vy -= fy;
        }
      }

      // 3. Gravity pulling nodes back to viewport center
      const centerX = w / 2;
      const centerY = h / 2;
      for (const node of simulationNodes) {
        const dx = centerX - node.x;
        const dy = centerY - node.y;
        node.vx += dx * gravity;
        node.vy += dy * gravity;

        // Apply friction and update position
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= friction;
        node.vy *= friction;
      }
    }

    setNodes(simulationNodes);
  }, []);

  // Window Resize listener
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine node styling based on content type
  const getNodeColor = (type: string, isHighlighted: boolean, isActive: boolean) => {
    if (isActive) return "#32D74B"; // Active/Current document node gets a radiant neon green
    if (hoveredNodeId) {
      if (!isHighlighted) return "#1e1e20"; // Dark zinc for dimmed nodes
    }

    switch (type) {
      case "project":
        return "#32D74B"; // Neon Green
      case "lab-notebook":
        return "#f59e0b"; // Amber
      case "research-note":
        return "#8b5cf6"; // Violet
      case "paper":
        return "#06b6d4"; // Cyan
      default:
        return "#8e9299"; // Zinc
    }
  };

  // Get active linked node IDs for highlight feedback
  const getNeighborNodeIds = () => {
    if (!hoveredNodeId) return new Set<string>();
    const neighbors = new Set<string>([hoveredNodeId]);
    for (const link of links) {
      if (link.source === hoveredNodeId) neighbors.add(link.target);
      if (link.target === hoveredNodeId) neighbors.add(link.source);
    }
    return neighbors;
  };

  const neighbors = getNeighborNodeIds();

  // Navigation handlers
  const handleZoom = (factor: number) => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(0.4, Math.min(3, prev.scale * factor)),
    }));
  };

  const handleReset = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  // Pan interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === "circle" || (e.target as HTMLElement).tagName === "text") return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative flex flex-col h-full bg-[#111113] rounded-xl border border-[#2D2D30] overflow-hidden group">
      {/* Header controls bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2D2D30] bg-[#0F0F11] text-xs text-[#8E9299]">
        <div className="flex items-center gap-1.5 font-medium text-white">
          <Network className="w-3.5 h-3.5 text-[#32D74B]" />
          <span className="font-mono uppercase tracking-wider text-[11px]">Interactive Knowledge Graph</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleZoom(1.15)}
            className="p-1 rounded hover:bg-white/5 hover:text-white transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(0.85)}
            className="p-1 rounded hover:bg-white/5 hover:text-white transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="p-1 rounded hover:bg-white/5 hover:text-white transition-all cursor-pointer"
            title="Reset Pan & Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-[#8E9299] font-mono">
            Loading knowledge graph...
          </div>
        ) : (
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            className="block"
          >
            <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
              {/* Link vectors */}
              {links.map((link, idx) => {
                const sourceNode = nodes.find((n) => n.id === link.source);
                const targetNode = nodes.find((n) => n.id === link.target);

                if (!sourceNode || !targetNode) return null;

                const isHighlighted =
                  !hoveredNodeId ||
                  (neighbors.has(link.source) && neighbors.has(link.target));

                return (
                  <line
                    key={`link-${idx}`}
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={isHighlighted ? "#32D74B" : "#1f1f23"}
                    strokeOpacity={isHighlighted ? 0.35 : 0.08}
                    strokeWidth={isHighlighted ? 1.5 : 0.8}
                    className="transition-all duration-300"
                  />
                );
              })}

              {/* Node bodies and text */}
              {nodes.map((node) => {
                const isHighlighted = !hoveredNodeId || neighbors.has(node.id);
                const isActive = node.id === activeSlug;
                const nodeColor = getNodeColor(node.type, isHighlighted, isActive);
                const r = isActive ? 10 : hoveredNodeId === node.id ? 9 : 7;

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onClick={() => onNodeClick(node.id)}
                  >
                    {/* Ring highlight animation on active or hovered */}
                    {(isActive || hoveredNodeId === node.id) && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={r + 4}
                        fill="none"
                        stroke={isActive ? "#32D74B" : nodeColor}
                        strokeOpacity={0.3}
                        strokeWidth={1.5}
                        className="animate-pulse"
                      />
                    )}

                    {/* Core node circle */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={r}
                      fill={nodeColor}
                      stroke="#0A0A0B"
                      strokeWidth={1.5}
                      className="transition-all duration-300"
                    />

                    {/* Title labels */}
                    {isHighlighted && (
                      <text
                        x={node.x}
                        y={node.y - (r + 5)}
                        textAnchor="middle"
                        fill={isActive ? "#32D74B" : hoveredNodeId === node.id ? "#ffffff" : "#8e9299"}
                        fontSize={isActive ? "11px" : "9.5px"}
                        fontWeight={isActive || hoveredNodeId === node.id ? "500" : "400"}
                        className="pointer-events-none select-none font-mono bg-[#0A0A0B]/90 px-1"
                      >
                        {node.label.length > 20 ? node.label.slice(0, 18) + "..." : node.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        )}
      </div>

      {/* Footer legend */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-[#2D2D30] bg-[#0A0A0B] text-[10px] text-[#8E9299] font-mono">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#32D74B]"></span>
            <span>Projects</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
            <span>Lab logs</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]"></span>
            <span>Notes</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]"></span>
            <span>Papers</span>
          </div>
        </div>
        <span className="hidden sm:inline">Drag to pan | Scroll to zoom</span>
      </div>
    </div>
  );
}
