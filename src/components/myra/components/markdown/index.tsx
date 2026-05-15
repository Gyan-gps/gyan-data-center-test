import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import { cn } from "../../lib/utils";

import { CodeBlock } from "./code-block";

type TMarkdownProps = { text: string; className?: string };

export const Markdown = ({ text, className }: TMarkdownProps) => {
  // Pre-process the markdown to handle any special cases
  const processedText = text.replace(/\\\[/g, "$$").replace(/\\\]/g, "$$");

  return (
    <div
      className={cn(
        // Base prose setup
        "prose",
        "max-w-none",
        "dark:prose-invert",

        // Reset heading scaling to text-base (16px)
        "prose-headings:font-semibold",
        "prose-headings:text-base",
        "prose-headings:leading-snug",
        "prose-h1:text-base",
        "prose-h2:text-base",
        "prose-h3:text-base",
        "prose-h4:text-base",
        "prose-h5:text-base",
        "prose-h6:text-base",

        // Paragraphs
        "prose-p:text-base",
        "prose-p:leading-7",
        "prose-p:my-2",

        // Lists
        "prose-li:text-base",
        "prose-li:my-0",
        "max-chat:prose-li:break-all",
        "prose-ul:my-2",
        "prose-ol:my-2",
        "prose-li:pl-1",

        // Links
        "prose-a:text-base",
        "prose-a:text-primary",
        "hover:prose-a:underline",

        // Code
        "prose-code:text-base",
        "prose-code:font-mono",
        "prose-code:px-1",
        "prose-code:py-0.5",
        "prose-code:rounded",
        "prose-code:bg-muted",

        // Preformatted blocks
        "prose-pre:bg-transparent",
        "prose-pre:p-0",
        "prose-pre:font-mono",
        "prose-pre:text-base",
        "prose-pre:leading-6",

        // Strong, Emphasis
        "prose-strong:text-base",
        "prose-strong:font-semibold",
        "prose-em:text-base",
        "prose-em:italic",

        // Blockquotes
        "prose-blockquote:text-base",
        "prose-blockquote:border-l-4",
        "prose-blockquote:pl-4",
        "prose-blockquote:border-muted-foreground/30",
        "prose-blockquote:text-muted-foreground",

        // Tables
        "prose-table:table-fixed",
        "prose-th:font-semibold",
        "prose-th:text-base",
        "prose-td:text-base",
        "prose-td:break-words",
        "prose-th:px-4",
        "prose-th:py-2",
        "prose-td:px-4",
        "prose-td:py-2",
        "prose-tr:even:bg-muted/40",

        // Images
        "prose-img:rounded-md",
        "prose-img:mx-auto",
        "prose-img:my-4",

        // Horizontal Rule
        "prose-hr:my-6",
        "prose-hr:border-muted",

        // Keyboard Input
        "prose-kbd:px-1.5",
        "prose-kbd:py-1",
        "prose-kbd:rounded",
        "prose-kbd:border",
        "prose-kbd:border-muted",
        "prose-kbd:bg-muted/50",
        "prose-kbd:text-base",
        "prose-kbd:font-mono",
        "prose-kbd:font-medium",

        // Highlight
        "prose-mark:text-base",
        "prose-mark:bg-yellow-100",
        "dark:prose-mark:bg-yellow-800",

        // Lead (optional for first paragraph)
        "prose-lead:text-base",

        className
      )}
    >
      <ReactMarkdown
        components={{
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";

            if (!inline && language) {
              return (
                <CodeBlock
                  language={language}
                  value={String(children).replace(/\n$/, "")}
                  {...props}
                />
              );
            }

            return (
              <code
                className={cn(
                  "rounded bg-muted px-1.5 py-0.5 font-mono text-xs",
                  className
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre({ children }: any) {
            return <>{children}</>;
          },
          a({ href, children, ...props }: any) {
            return (
              <a
                className="text-primary underline underline-offset-2 hover:no-underline"
                href={href}
                rel="noopener noreferrer"
                target="_blank"
                {...props}
              >
                {children}
              </a>
            );
          },
        }}
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm]}
      >
        {processedText}
      </ReactMarkdown>
    </div>
  );
};
