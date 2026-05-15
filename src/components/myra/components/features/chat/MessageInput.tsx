import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

import { Send } from "lucide-react";

import type { TMessageInputProps } from "../../../types/components";
import { cn } from "../../../lib/utils";

import { Button } from "../../../components/ui/button";

export const MessageInput = ({
  onSend,
  isDisabled = false,
  placeholder = "Commissioned capacity of DataCenter in Singapore ",
  className,
}: TMessageInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isDisabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handleSubmit(e as any);
    }
  };

  return (
    <>
      <form
        className={cn(
          "relative flex w-full items-end rounded-xl border border-primary bg-white" +
            "shadow-[0_4px_12px_rgba(0,0,0,0.15)] " +
            "focus-within:shadow-[0_8px_24px_rgba(0,0,0,0.3)] " +
            "focus-within:border-primary " +
            "transition-shadow duration-200 ease-in-out",
          className
        )}
        onSubmit={handleSubmit}
      >
        <textarea
          ref={textareaRef}
          autoFocus
          className="max-h-40 flex-1 resize-none overflow-y-auto rounded-xl border-none p-3 text-base focus:outline-none disabled:bg-white md:px-4"
          disabled={isDisabled}
          placeholder={placeholder}
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <Button
          className={`h-full min-h-12 rounded-none rounded-r-xl bg-primary px-4 py-1 shadow-none hover:bg-primary/90`}
          disabled={!message.trim() || isDisabled}
          size="icon"
          type="submit"
        >
          <Send className="size-5" />
        </Button>
      </form>
    </>
  );
};
