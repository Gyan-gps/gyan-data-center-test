import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Star } from "lucide-react";

import { cn } from "@/utils/cn";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 bg-transparent border-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 relative",
      className,
    )}
    {...props}
  >
    <Star 
      className={cn(
        "h-4 w-4 transition-colors",
        props.checked 
          ? "fill-transparent stroke-yellow-500"  // Only stroke changes, fill remains transparent
          : "fill-transparent stroke-gray-400"
      )}
    />
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };