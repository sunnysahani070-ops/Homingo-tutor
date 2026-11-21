'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  content: string;
  className?: string;
  inline?: boolean;
}

export function MathView({ content, className = '', inline = false }: MathViewProps) {
  const renderedElements = useMemo(() => {
    if (!content) return null;

    // Split content by $$ (block) and $ (inline)
    const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g);

    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
        const mathStr = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(mathStr, {
            displayMode: true,
            throwOnError: false,
          });
          return (
            <span
              key={index}
              className="block my-2 overflow-x-auto text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={index} className="text-red-500 font-mono text-sm">{part}</span>;
        }
      } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const mathStr = part.slice(1, -1).trim();
        try {
          const html = katex.renderToString(mathStr, {
            displayMode: false,
            throwOnError: false,
          });
          return (
            <span
              key={index}
              className="inline-block px-0.5"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={index} className="text-red-500 font-mono text-xs">{part}</span>;
        }
      }

      // Normal text with line breaks preserved
      return (
        <span key={index} className="whitespace-pre-wrap">
          {part}
        </span>
      );
    });
  }, [content]);

  const Tag = inline ? 'span' : 'div';
  return <Tag className={`leading-relaxed ${className}`}>{renderedElements}</Tag>;
}
