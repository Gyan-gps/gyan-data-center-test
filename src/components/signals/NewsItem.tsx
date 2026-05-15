import { Badge } from "./ui/badge";
import { Checkbox } from "@/components/ui";
import { cn } from "@/utils/cn";
import { updateNewsFavorite } from "@/network/signals/signals.api";
import type { NewsStreamItem } from "@/network/signals/signals.types";
import { useState, useEffect } from "react";
import { forwardRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { NewsArticle } from "@/network/news/news.types";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown, ChevronUp, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router";
import { formatCompanyNameToRedirect } from "@/utils";

const FALLBACK_NEWS_IMAGE = "https://cdn.pixabay.com/photo/2016/02/01/00/56/news-1172463_960_720.jpg";

function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;

  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();

    // Reject GIF explicitly
    if (pathname.endsWith(".gif")) return false;

    // Allow only specific extensions
    return /\.(jpg|jpeg|png|webp)$/.test(pathname);
  } catch {
    // Invalid URL format
    return false;
  }
}

interface NewsItemProps {
  item: NewsStreamItem | NewsArticle;
  isFavorite: boolean;
  onSelect?: () => void;
  onFavoriteChange?: () => void;
}

export const NewsItem = forwardRef<HTMLDivElement, NewsItemProps>(
  (
    {
      item,
      isFavorite: propFavorite,
      // onSelect,
      onFavoriteChange,
    }: NewsItemProps,
    ref
  ) => {
    const navigate = useNavigate();

    const hasCompanies = item.companies && item.companies.length > 0;
    const hasAssets = item.assets && item.assets.length > 0;
    const showAccordion = hasCompanies || hasAssets;

    const handleViewDetails = (id: string) => {
      navigate(`/datacenter/${id}`);
    };
    const queryClient = useQueryClient();

    const [isFavorite, setIsFavorite] = useState(propFavorite);
    useEffect(() => {
      setIsFavorite(propFavorite);
    }, [propFavorite]);
    const handleFavoriteToggle = async (checked: boolean) => {
      // Update instantly for better UX
      setIsFavorite(checked);

      const action = checked ? "add" : "remove";

      try {
        await updateNewsFavorite({
          newsId: item._id,
          action,
        });

        // Refresh dashboard after successful update
        await queryClient.invalidateQueries({
          queryKey: ["signals-dashboard"],
        });

        onFavoriteChange?.();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: { message?: string } | any) {
        // Handle "already added" or "not found" gracefully
        if (error?.message?.includes("already added")) {
          console.warn(`News ${item._id} is already in favorites.`);
        } else if (error?.message?.includes("not found")) {
          console.warn(`News ${item._id} not found in favorites.`);
        } else {
          console.error("Favorite update failed:", error);
        }

        // Rollback UI only if it's a real failure
        setIsFavorite(propFavorite);
      }
    };
    return (
      <div
        ref={ref}
        className="p-3 sm:p-5 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors w-full max-w-full overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 w-full max-w-full">
          {/* Favorite Checkbox */}
          <Checkbox
            checked={isFavorite}
            onCheckedChange={(checked) => handleFavoriteToggle(!!checked)}
            className="sm:mt-1 order-1 sm:order-none flex-shrink-0"
          />

          {/* Article Image */}
            <img
            src={isValidImageUrl(item?.image) ? item?.image : FALLBACK_NEWS_IMAGE}
            alt={item.title.slice(0, 50) + "..."}
            title={item.title}
            className="w-full h-48 object-cover rounded-md border border-border sm:w-28 sm:h-28 sm:flex-shrink-0 md:w-32 md:h-32 order-2"
            onError={({ target }) => {
              (target as HTMLImageElement).src = FALLBACK_NEWS_IMAGE;
            }}
            />

          <div className="flex-1 min-w-0 space-y-3 order-3 w-full max-w-full overflow-hidden">
            {/* Category, Date, Source */}
            <div className="flex flex-wrap items-center gap-2 text-xs w-full">
              {item.impact ? (
                <Badge
                  variant="outline"
                  className={cn(
                    "font-normal flex-shrink-0",
                    item.impact === "Opportunity" &&
                      "bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]",
                    item.impact === "Risk" &&
                      "bg-[#E11D48]/10 text-[#E11D48] border-[#E11D48]",
                    item.impact === "Neutral" &&
                      "bg-gray-400/10 text-gray-600 border-gray-400"
                  )}
                >
                  {item.impact}
                </Badge>
              ) : null}

              {item.LLM_category?.length > 0 && (
                <Badge variant="outline" className="font-medium flex-shrink-0">
                  {item.LLM_category[0]}
                </Badge>
              )}
              {item.primary_region && (
                <span className="font-medium text-foreground flex-shrink-0">
                  {item.primary_region}
                </span>
              )}

              <span className="text-muted-foreground flex-shrink-0">
                {new Date(item.publishedDate).toLocaleDateString()}
              </span>

              <span className="text-muted-foreground flex-shrink-0">·</span>

              <span className="font-medium text-foreground truncate">
                {item.source?.title ?? item.source?.name ?? "Unknown"}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-base font-semibold text-foreground mb-2">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-words"
              >
                {item.LLM_headline}
              </a>
            </h3>

            {/* Body Preview */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.summary}
            </p>

            {showAccordion && (
              <Accordion.Root type="single" collapsible className="pt-3 w-full">
                <Accordion.Item
                  value="details"
                  className="rounded-md w-full border border-border bg-card"
                >
                  <Accordion.Header>
                    <Accordion.Trigger
                      className="group flex w-full items-center justify-between gap-2 px-3 py-2 text-sm font-medium 
             rounded-t-md bg-muted/40 hover:bg-muted/70 transition"
                    >
                      <span>Companies & Projects</span>

                      <span className="relative flex items-center flex-shrink-0">
                        <ChevronDown className="h-4 w-4 transition-opacity duration-200 group-data-[state=open]:opacity-0" />
                        <ChevronUp className="absolute h-4 w-4 opacity-0 transition-opacity duration-200 group-data-[state=open]:opacity-100" />
                      </span>
                    </Accordion.Trigger>
                  </Accordion.Header>

                  <Accordion.Content className="pt-3 px-3 pb-3 w-full space-y-4 rounded-b-md">
                    {hasCompanies && (
                      <div className="space-y-2 w-full">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Companies
                        </p>
                        <div className="flex flex-wrap gap-2 w-full">
                          {item.companies.map((c) => (
                            <button
                              key={c.id}
                              onClick={() =>
                                navigate(
                                  `/company/${formatCompanyNameToRedirect(
                                    String(c.company)
                                  )}/${c.id}`
                                )
                              }
                              className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition cursor-pointer max-w-full"
                            >
                              <span className="flex items-center gap-1">
                                <span className="truncate">{c.company}</span>
                                <ArrowUpRight className="h-3 w-3 flex-shrink-0" />
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {hasAssets && (
                      <div className="space-y-2 w-full">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Projects
                        </p>
                        <div className="flex flex-wrap gap-2 w-full">
                          {item.assets.map((p) => (
                            <button
                              key={p.dc_id}
                              onClick={() => handleViewDetails(p.dc_id)}
                              className="px-2 py-1 text-xs rounded-full bg-amber-200/40 text-amber-700 hover:bg-amber-300/50 transition cursor-pointer max-w-full"
                            >
                              <span className="flex items-center gap-1">
                                <span className="truncate">
                                  {p.data_center_facility_name}
                                </span>
                                <ArrowUpRight className="h-3 w-3 flex-shrink-0" />
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion.Root>
            )}
          </div>
        </div>
      </div>
    );
  }
);
