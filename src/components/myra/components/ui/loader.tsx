import { cn } from "../../lib/utils";

type LoaderProps = {
  fullScreen?: boolean;
  center?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "white";
  overlay?: boolean;
  text?: string;
};

const Loader = ({
  fullScreen = false,
  center = true,
  size = "md",
  color = "primary",
  overlay = false,
  text,
}: LoaderProps) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  const colorClasses = {
    primary: "border-primary border-t-transparent",
    secondary: "border-secondary border-t-transparent",
    white: "border-white border-t-transparent",
  };

  const containerClasses = cn(
    "flex flex-col items-center gap-3",
    fullScreen && "fixed inset-0",
    center && "justify-center",
    overlay && "bg-black/50"
  );

  return (
    <div className={containerClasses}>
      <div
        className={cn(
          "animate-spin rounded-full",
          sizeClasses[size],
          colorClasses[color]
        )}
      />
      {text && (
        <span
          className={cn(
            "text-sm font-medium",
            color === "white" ? "text-white" : "text-gray-600"
          )}
        >
          {text}
        </span>
      )}
    </div>
  );
};

export default Loader;
