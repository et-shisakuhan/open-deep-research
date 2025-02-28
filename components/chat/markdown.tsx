import React, { memo } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  const components = {
    // Root wrapper
    root: ({ children }: any) => (
      <div className="prose prose-zinc dark:prose-invert max-w-none text-sm">
        {children}
      </div>
    ),

    // Code blocks with GitHub-like styling
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <pre
          {...props}
          className="
            relative
            text-sm
            w-full
            overflow-x-auto
            bg-gray-100 dark:bg-zinc-800
            border border-gray-200 dark:border-zinc-700
            p-4
            rounded-md
            font-mono
          "
        >
          <div className="absolute right-2 top-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-zinc-700 px-2 py-1 rounded font-sans">
            {match[1]}
          </div>
          <code className="text-gray-800 dark:text-gray-200">{children}</code>
        </pre>
      ) : (
        <code
          className="
            text-sm
            bg-gray-100 dark:bg-zinc-800
            border border-gray-200 dark:border-zinc-700
            py-0.5 px-1.5
            rounded-md
            font-mono
            text-red-600 dark:text-red-400
          "
          {...props}
        >
          {children}
        </code>
      );
    },

    // GitHub-style headings
    h1: ({ node, children, ...props }: any) => {
      return (
        <h1
          className="
            text-2xl
            font-semibold
            text-gray-900 dark:text-gray-100
            mb-4
            pb-2
            border-b
            border-gray-200 dark:border-zinc-700
          "
          {...props}
        >
          {children}
        </h1>
      );
    },

    h2: ({ node, children, ...props }: any) => {
      return (
        <h2
          className="
            text-xl
            font-semibold
            text-gray-900 dark:text-gray-100
            mt-8
            mb-4
            pb-1
            border-b
            border-gray-200 dark:border-zinc-700
          "
          {...props}
        >
          {children}
        </h2>
      );
    },

    h3: ({ node, children, ...props }: any) => {
      return (
        <h3
          className="
            text-lg
            font-semibold
            text-gray-900 dark:text-gray-100
            mt-6
            mb-3
          "
          {...props}
        >
          {children}
        </h3>
      );
    },

    // GitHub-style paragraphs and lists
    p: ({ node, children, ...props }: any) => {
      return (
        <p
          className="
            text-sm
            text-gray-700 dark:text-gray-300
            leading-relaxed
            mb-4
          "
          {...props}
        >
          {children}
        </p>
      );
    },

    ul: ({ node, children, ...props }: any) => {
      return (
        <ul
          className="
            text-sm
            list-disc
            list-outside
            ml-6
            space-y-1
            mb-4
            text-gray-700 dark:text-gray-300
          "
          {...props}
        >
          {children}
        </ul>
      );
    },

    ol: ({ node, children, ...props }: any) => {
      return (
        <ol
          className="
            text-sm
            list-decimal
            list-outside
            ml-6
            space-y-1
            mb-4
            text-gray-700 dark:text-gray-300
          "
          {...props}
        >
          {children}
        </ol>
      );
    },

    li: ({ node, children, ...props }: any) => {
      return (
        <li
          className="
            text-sm
            leading-relaxed
            pb-1
          "
          {...props}
        >
          {children}
        </li>
      );
    },

    // GitHub-style tables
    table: ({ node, children, ...props }: any) => {
      return (
        <div className="w-full overflow-x-auto mb-4 border border-gray-200 dark:border-zinc-700 rounded-md">
          <table
            className="
              min-w-full
              border-collapse
              text-sm
              my-0
            "
            {...props}
          >
            {children}
          </table>
        </div>
      );
    },

    th: ({ node, children, ...props }: any) => {
      return (
        <th
          className="
            text-sm
            border-b
            border-gray-200 dark:border-zinc-700
            bg-gray-100 dark:bg-zinc-800
            p-3
            text-left
            font-semibold
            text-gray-700 dark:text-gray-300
          "
          {...props}
        >
          {children}
        </th>
      );
    },

    td: ({ node, children, ...props }: any) => {
      return (
        <td
          className="
            text-sm
            border-b
            border-gray-200 dark:border-zinc-700
            p-3
            text-gray-700 dark:text-gray-300
          "
          {...props}
        >
          {children}
        </td>
      );
    },

    // GitHub-style blockquotes
    blockquote: ({ node, children, ...props }: any) => {
      return (
        <blockquote
          className="
            text-sm
            border-l-4
            border-red-300 dark:border-red-800
            pl-4
            pr-2
            py-1
            bg-gray-50 dark:bg-zinc-800
            text-gray-600 dark:text-gray-400
            my-4
            rounded-r-md
          "
          {...props}
        >
          {children}
        </blockquote>
      );
    },

    // GitHub-style links
    a: ({ node, children, ...props }: any) => {
      return (
        <Link
          className="
            text-red-600 dark:text-red-400
            hover:text-red-800 dark:hover:text-red-300
            hover:underline
            transition-colors
            duration-200
          "
          target="_blank"
          rel="noreferrer"
          {...props}
        >
          {children}
        </Link>
      );
    },

    // GitHub-style bold text
    strong: ({ node, children, ...props }: any) => {
      return (
        <span
          className="
            font-semibold
            text-gray-900 dark:text-gray-100
          "
          {...props}
        >
          {children}
        </span>
      );
    },
  };

  return (
    <div className="markdown-github p-5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
