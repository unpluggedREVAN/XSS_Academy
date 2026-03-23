import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const renderContent = () => {
    const sections = content.split('\n\n');

    return sections.map((section, idx) => {
      const trimmed = section.trim();
      if (!trimmed) return null;

      // Headings with **
      if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.includes('\n')) {
        return (
          <h4 key={idx} className="text-lg font-bold text-white mt-6 mb-3">
            {trimmed.replace(/\*\*/g, '')}
          </h4>
        );
      }

      // Numbered lists
      if (/^\d+\./.test(trimmed)) {
        const items = trimmed.split('\n').filter(line => /^\d+\./.test(line.trim()));
        return (
          <ol key={idx} className="list-decimal list-inside space-y-2 my-4 ml-4">
            {items.map((item, iIdx) => {
              const text = item.replace(/^\d+\.\s*/, '');
              return (
                <li key={iIdx} className="text-gray-300">
                  {renderInlineFormatting(text)}
                </li>
              );
            })}
          </ol>
        );
      }

      // Bullet lists
      if (/^[-•]/.test(trimmed)) {
        const items = trimmed.split('\n').filter(line => /^[-•]/.test(line.trim()));
        return (
          <ul key={idx} className="list-disc list-inside space-y-2 my-4 ml-4">
            {items.map((item, iIdx) => {
              const text = item.replace(/^[-•]\s*/, '');
              return (
                <li key={iIdx} className="text-gray-300">
                  {renderInlineFormatting(text)}
                </li>
              );
            })}
          </ul>
        );
      }

      // Regular paragraphs
      return (
        <p key={idx} className="text-gray-300 leading-relaxed my-3">
          {renderInlineFormatting(trimmed)}
        </p>
      );
    });
  };

  const renderInlineFormatting = (text: string) => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Bold text **...**
      const boldMatch = remaining.match(/^(.*?)\*\*([^*]+?)\*\*(.*)/);
      if (boldMatch) {
        if (boldMatch[1]) {
          parts.push(<span key={key++}>{boldMatch[1]}</span>);
        }
        parts.push(
          <strong key={key++} className="font-semibold text-white">
            {boldMatch[2]}
          </strong>
        );
        remaining = boldMatch[3];
        continue;
      }

      // Inline code `...`
      const codeMatch = remaining.match(/^(.*?)`([^`]+?)`(.*)/);
      if (codeMatch) {
        if (codeMatch[1]) {
          parts.push(<span key={key++}>{codeMatch[1]}</span>);
        }
        parts.push(
          <code key={key++} className="bg-gray-800 px-1.5 py-0.5 rounded text-blue-300 text-sm font-mono">
            {codeMatch[2]}
          </code>
        );
        remaining = codeMatch[3];
        continue;
      }

      // No more formatting, add the rest
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    return parts;
  };

  return <div className="prose prose-invert max-w-none">{renderContent()}</div>;
}
