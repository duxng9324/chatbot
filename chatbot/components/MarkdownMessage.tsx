'use client'

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownMessageProps {
  content: string;
}

export default function MarkdownMessage({
  content,
}: MarkdownMessageProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: (props) => (
          <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          />
        ),

        ul: (props) => (
          <ul className="list-disc pl-4 space-y-1" {...props} />
        ),

        ol: (props) => (
          <ol className="list-decimal pl-4 space-y-1" {...props} />
        ),

        code: (props) => {
          const { children, className } = props;
          const isBlock = className?.includes("language-");

          if (!isBlock) {
            return (
              <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                {children}
              </code>
            );
          }

          return (
            <pre className="bg-gray-900 text-white text-xs p-3 rounded overflow-x-auto">
              <code>{children}</code>
            </pre>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
