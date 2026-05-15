import { useState } from "react";

import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

import { cn } from "../../lib/utils";

import { Button } from "../../components/ui/button";

type TCodeBlockProps = {
  language: string; // Programming language for syntax highlighting
  value: string; // Code content to display
  className?: string;
};

export const CodeBlock = ({ language, value, className }: TCodeBlockProps) => {
  const [isCopied, setIsCopied] = useState(false);

  // Copy code to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      // Reset copy button after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className={cn("group relative my-4", className)}>
      {/* Copy button - appears on hover */}
      <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          className="size-8 bg-background/80 backdrop-blur-sm hover:bg-background"
          size="icon"
          variant="ghost"
          onClick={copyToClipboard}
        >
          {isCopied ? (
            <Check className="size-4 text-green-500" />
          ) : (
            <Copy className="size-4" />
          )}
        </Button>
      </div>

      {/* Code block container */}
      <div className="overflow-hidden rounded-lg border bg-muted/50">
        {/* Language label */}
        {language && (
          <div className="border-b bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
            {language}
          </div>
        )}

        {/* Syntax highlighted code */}
        <SyntaxHighlighter
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "transparent",
            fontSize: "0.875rem",
            lineHeight: "1.5",
          }}
          language={language || "text"}
          PreTag="div"
          showLineNumbers={true}
          style={oneDark}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
