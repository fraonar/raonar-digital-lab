/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Link, Clipboard, Check } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  onNavigate?: (slug: string) => void;
  allSlugs?: string[];
  isLight?: boolean;
}

export function MarkdownRenderer({
  content,
  onNavigate,
  allSlugs = [],
  isLight = false,
}: MarkdownRendererProps) {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Dynamic theme styling classes
  const textClass = isLight ? "text-zinc-850" : "text-zinc-300";
  const headingClass = isLight ? "text-zinc-950" : "text-white";
  const borderClass = isLight ? "border-zinc-200" : "border-zinc-800";
  const codeBgClass = isLight ? "bg-zinc-50 border-zinc-200 text-emerald-700" : "bg-zinc-950/70 border-zinc-800 text-emerald-400";
  const inlineCodeClass = isLight ? "bg-zinc-100 text-emerald-700 border-zinc-200" : "bg-zinc-950 text-emerald-400 border-zinc-800/80";
  const mathBlockClass = isLight ? "bg-emerald-500/5 border-emerald-200 text-emerald-700" : "bg-zinc-900/40 border-zinc-800/80 text-emerald-400";
  const quoteClass = isLight ? "border-emerald-500 bg-emerald-50/20 text-zinc-800" : "border-emerald-500 bg-emerald-500/5 text-zinc-300";

  // Pre-process and render paragraphs, headers, and custom structures
  const parseLines = () => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let currentBlock: "list" | "code" | "blockquote" | null = null;
    let listItems: string[] = [];
    let codeLines: string[] = [];
    let codeLanguage = "";
    let blockquoteLines: string[] = [];
    let keyCounter = 0;

    const flushBlock = () => {
      if (currentBlock === "list") {
        elements.push(
          <ul
            key={`list-${keyCounter++}`}
            className={`list-disc pl-6 my-4 space-y-2 ${textClass}`}
          >
            {listItems.map((item, idx) => (
              <li key={idx}>{renderInlineText(item)}</li>
            ))}
          </ul>
        );
        listItems = [];
      } else if (currentBlock === "code") {
        const fullCode = codeLines.join("\n");
        const idx = keyCounter++;
        elements.push(
          <div
            key={`code-${idx}`}
            className={`relative my-6 rounded-lg border ${borderClass} ${isLight ? 'bg-zinc-50' : 'bg-zinc-950/70'} font-mono text-sm leading-relaxed overflow-hidden`}
          >
            <div className={`flex items-center justify-between px-4 py-1.5 border-b ${borderClass} ${isLight ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-900/60 text-zinc-400'} text-xs`}>
              <span>{codeLanguage || "code"}</span>
              <button
                onClick={() => handleCopy(fullCode, idx)}
                className={`flex items-center gap-1.5 ${isLight ? 'hover:text-zinc-950 text-zinc-600' : 'hover:text-white text-zinc-400'} transition-colors cursor-pointer`}
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className={`p-4 overflow-x-auto ${isLight ? 'text-zinc-800' : 'text-emerald-400/90'} whitespace-pre`}>
              <code>{fullCode}</code>
            </pre>
          </div>
        );
        codeLines = [];
        codeLanguage = "";
      } else if (currentBlock === "blockquote") {
        elements.push(
          <blockquote
            key={`quote-${keyCounter++}`}
            className={`pl-4 py-1 my-4 border-l-2 ${quoteClass} italic`}
          >
            {blockquoteLines.map((line, idx) => (
              <p key={idx} className="my-1">
                {renderInlineText(line)}
              </p>
            ))}
          </blockquote>
        );
        blockquoteLines = [];
      }
      currentBlock = null;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Handle Code Block fence
      if (line.trim().startsWith("```")) {
        if (currentBlock === "code") {
          flushBlock();
        } else {
          flushBlock();
          currentBlock = "code";
          codeLanguage = line.trim().slice(3).trim();
        }
        continue;
      }

      if (currentBlock === "code") {
        codeLines.push(line);
        continue;
      }

      // Handle blockquote
      if (line.trim().startsWith(">")) {
        if (currentBlock !== "blockquote") {
          flushBlock();
          currentBlock = "blockquote";
        }
        blockquoteLines.push(line.replace(/^>\s?/, ""));
        continue;
      }

      // Handle Bullet Lists
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        if (currentBlock !== "list") {
          flushBlock();
          currentBlock = "list";
        }
        listItems.push(line.trim().slice(2));
        continue;
      }

      // Default fallback if we exit a list, blockquote or code block
      if (line.trim() === "" && currentBlock) {
        // We let empty lines within a blockquote continue, but break lists
        if (currentBlock === "list") {
          flushBlock();
        } else if (currentBlock === "blockquote") {
          blockquoteLines.push("");
        }
        continue;
      }

      if (currentBlock && !line.trim().startsWith("- ") && !line.trim().startsWith("* ") && !line.trim().startsWith(">")) {
        flushBlock();
      }

      // Render Headers
      if (line.startsWith("# ")) {
        elements.push(
          <h1
            key={`h1-${keyCounter++}`}
            className={`text-2xl font-semibold tracking-tight ${headingClass} mt-8 mb-4 border-b ${borderClass} pb-2`}
          >
            {renderInlineText(line.slice(2))}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2
            key={`h2-${keyCounter++}`}
            className={`text-xl font-semibold tracking-tight ${headingClass} mt-7 mb-3.5 flex items-center gap-2`}
          >
            <span className={`w-1.5 h-4 ${isLight ? 'bg-[#15803D]' : 'bg-[#32D74B]'} rounded-sm`}></span>
            {renderInlineText(line.slice(3))}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3
            key={`h3-${keyCounter++}`}
            className={`text-lg font-medium tracking-tight ${headingClass} mt-6 mb-2.5 font-mono`}
          >
            {renderInlineText(line.slice(4))}
          </h3>
        );
      }
      // Handle Horizontal Rule
      else if (line.trim() === "---") {
        elements.push(
          <hr
            key={`hr-${keyCounter++}`}
            className={`my-8 ${borderClass}`}
          />
        );
      }
      // Math Block Equations, e.g. $$ formula $$
      else if (line.trim().startsWith("$$") && line.trim().endsWith("$$")) {
        const formula = line.trim().slice(2, -2).trim();
        elements.push(
          <div
            key={`mathblock-${keyCounter++}`}
            className={`my-6 p-4 rounded-lg border ${mathBlockClass} text-center font-serif overflow-x-auto`}
          >
            <div className="inline-block text-base">{formula}</div>
          </div>
        );
      }
      // Math block start/end across multiple lines
      else if (line.trim() === "$$") {
        let mathLines = [];
        i++;
        while (i < lines.length && lines[i].trim() !== "$$") {
          mathLines.push(lines[i]);
          i++;
        }
        elements.push(
          <div
            key={`mathblock-${keyCounter++}`}
            className={`my-6 p-4 rounded-lg border ${mathBlockClass} text-center font-serif overflow-x-auto`}
          >
            <div className="inline-block text-base">{mathLines.join(" ")}</div>
          </div>
        );
      }
      // Standard Paragraph
      else if (line.trim() !== "") {
        elements.push(
          <p
            key={`p-${keyCounter++}`}
            className={`my-4 ${textClass} leading-relaxed text-[15px]`}
          >
            {renderInlineText(line)}
          </p>
        );
      }
    }

    // Flush any trailing block
    flushBlock();

    return elements;
  };

  // Parse inline styles like **bold**, *italic*, `code`, and [links](url) or math $x$
  const renderInlineText = (text: string): React.ReactNode[] => {
    // We parse token by token
    const result: React.ReactNode[] = [];
    let i = 0;
    let keyIdx = 0;

    while (i < text.length) {
      // 1. Math formulas inline: $ ... $
      if (text[i] === "$" && text[i + 1] !== "$") {
        const nextDollar = text.indexOf("$", i + 1);
        if (nextDollar !== -1) {
          const formula = text.slice(i + 1, nextDollar);
          result.push(
            <span
              key={`math-${keyIdx++}`}
              className={`font-serif italic px-1 mx-0.5 bg-emerald-500/5 rounded ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}
            >
              {formula}
            </span>
          );
          i = nextDollar + 1;
          continue;
        }
      }

      // 2. Bold: **text**
      if (text.startsWith("**", i)) {
        const nextBold = text.indexOf("**", i + 2);
        if (nextBold !== -1) {
          result.push(
            <strong key={`bold-${keyIdx++}`} className={`font-semibold ${isLight ? 'text-zinc-950' : 'text-white'}`}>
              {text.slice(i + 2, nextBold)}
            </strong>
          );
          i = nextBold + 2;
          continue;
        }
      }

      // 3. Italic: *text*
      if (text[i] === "*") {
        const nextItalic = text.indexOf("*", i + 1);
        if (nextItalic !== -1) {
          result.push(
            <em key={`italic-${keyIdx++}`} className={`italic ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>
              {text.slice(i + 1, nextItalic)}
            </em>
          );
          i = nextItalic + 1;
          continue;
        }
      }

      // 4. Code: `code`
      if (text[i] === "`") {
        const nextCode = text.indexOf("`", i + 1);
        if (nextCode !== -1) {
          result.push(
            <code
              key={`code-${keyIdx++}`}
              className={`px-1.5 py-0.5 rounded ${inlineCodeClass} font-mono text-[13px] border`}
            >
              {text.slice(i + 1, nextCode)}
            </code>
          );
          i = nextCode + 1;
          continue;
        }
      }

      // 4.5. Images: ![alt](url)
      if (text.startsWith("![", i)) {
        const closeBracket = text.indexOf("]", i + 2);
        if (closeBracket !== -1 && text[closeBracket + 1] === "(") {
          const closeParen = text.indexOf(")", closeBracket + 1);
          if (closeParen !== -1) {
            const altText = text.slice(i + 2, closeBracket);
            let imgUrl = text.slice(closeBracket + 2, closeParen);

            // Handle relative image paths
            if (!imgUrl.startsWith("http://") && !imgUrl.startsWith("https://") && !imgUrl.startsWith("/")) {
              imgUrl = "/" + imgUrl;
            }

            result.push(
              <img
                key={`img-${keyIdx++}`}
                src={imgUrl}
                alt={altText}
                className={`max-w-full h-auto rounded-lg my-4 inline-block border ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}
              />
            );
            i = closeParen + 1;
            continue;
          }
        }
      }

      // 5. Links: [text](url)
      if (text[i] === "[") {
        const closeBracket = text.indexOf("]", i);
        if (closeBracket !== -1 && text[closeBracket + 1] === "(") {
          const closeParen = text.indexOf(")", closeBracket + 1);
          if (closeParen !== -1) {
            const linkText = text.slice(i + 1, closeBracket);
            const linkUrl = text.slice(closeBracket + 2, closeParen);

            const isInternal =
              allSlugs.includes(linkUrl) ||
              linkUrl.startsWith("#") ||
              !linkUrl.includes(".");

            if (isInternal && onNavigate) {
              result.push(
                <button
                  key={`link-${keyIdx++}`}
                  onClick={() => onNavigate(linkUrl)}
                  className={`inline-flex items-center gap-0.5 ${isLight ? 'text-emerald-700 hover:text-emerald-800' : 'text-emerald-400 hover:text-emerald-300'} font-medium hover:underline cursor-pointer`}
                >
                  {linkText}
                  <Link className="w-3 h-3 opacity-60 inline" />
                </button>
              );
            } else {
              result.push(
                <a
                  key={`link-${keyIdx++}`}
                  href={linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-0.5 ${isLight ? 'text-emerald-700 hover:text-emerald-800' : 'text-emerald-400 hover:text-emerald-300'} font-medium hover:underline`}
                >
                  {linkText}
                  <Link className="w-3 h-3 opacity-60 inline" />
                </a>
              );
            }
            i = closeParen + 1;
            continue;
          }
        }
      }

      // Default append single character
      result.push(text[i]);
      i++;
    }

    return result;
  };

  return <div className={`${textClass} leading-relaxed font-sans`}>{parseLines()}</div>;
}
