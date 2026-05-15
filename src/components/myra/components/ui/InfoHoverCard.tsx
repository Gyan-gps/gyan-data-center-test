import * as HoverCard from "@radix-ui/react-hover-card";
import { CheckCircle2, Info } from "lucide-react";

import { Button } from "../../components/ui/button";

export const InfoHoverCard = () => {
  return (
    <HoverCard.Root closeDelay={100} openDelay={100}>
      <HoverCard.Trigger asChild>
        <Button
          aria-label="Info"
          className="hidden text-gray-600 hover:text-gray-800 md:flex"
          size="icon"
          variant="ghost"
        >
          <Info className="size-5" />
        </Button>
      </HoverCard.Trigger>

      <HoverCard.Portal>
        <HoverCard.Content
          align="center"
          className="relative z-50 w-80 rounded-lg bg-white p-4 shadow-lg ring-1 ring-gray-200"
          side="right"
          sideOffset={12}
        >
          {/* Arrow */}
          <div className="absolute left-[-8px] top-1/2 size-4 -translate-y-1/2 rotate-45 bg-white ring-1 ring-gray-200" />

          {/* Content */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">
              DCX AI Info
            </span>
          </div>

          <ul className="space-y-2">
            {[
              "Instant answers to your industry-research questions",
              "Interactive charts for deeper insight",
              "Sign in to save every conversation",
              "Custom-built for industry analysis, backed by 1M+ expert hours",
              "Engineered for market intelligence with verified data",
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-[#2C8EBF]" />
                <span className="text-sm leading-snug text-gray-700">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};
