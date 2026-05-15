import { Bot, Loader2 } from "lucide-react";

import BrowseReportCatalog from "../../../components/browse-report-catalog";
import { GraphContainer } from "../../../components/graph-container";
import { Markdown } from "../../../components/markdown";
import SearchReportContent from "../../../components/search-report-content";
import { cn } from "@/components/myra/lib/utils";
import { useStreamStore } from "@/components/myra/hooks/custom/useStreamStore";

export const StreamingMessage = () => {
  const { currentEvent, finalData, chatFinished } = useStreamStore();

  const renderContent = () => {
    // Show loader if no content yet
    if (!currentEvent && finalData.length < 1) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Thinking...</span>
        </div>
      );
    }

    return (
      <>
        {finalData.map((item: any, index: number) => {
          if (item.type === "text") {
            return <Markdown key={index} text={item.content} />;
          } else if (item.type === "graph") {
            try {
              const graphData = JSON.parse(item.content);

              if (graphData.data) {
                return (
                  <GraphContainer
                    key={index}
                    data={graphData.data}
                    title={graphData.title}
                    type={graphData.type || "bar"}
                  />
                );
              }
            } catch {
              // Fallback if parsing fails
              return (
                <div
                  key={`graph-${index}`}
                  className="my-3 rounded-lg border bg-card p-4"
                >
                  <p className="text-sm text-muted-foreground">
                    📊 Graph: {item.graph}
                  </p>
                </div>
              );
            }
          } else if (item.type === "image") {
            return (
              <div key={`image-${index}`} className="my-3">
                <img
                  alt="AI generated image"
                  className="w-full max-w-md rounded-lg"
                  height={300}
                  src={item.content}
                  width={400}
                />
              </div>
            );
          } else if (item.type === "followup_question") {
            return (
              <div key={index} className="my-3 space-y-2">
                <p className="text-sm font-medium text-primary">
                  You might also ask:
                </p>
                <ul className="space-y-1">
                  {[
                    Array.isArray(item.content)
                      ? item.content
                      : JSON.parse(item.content)?.split(", "),
                  ].map((question: string, pos: number) => (
                    <li
                      key={pos}
                      className="pl-4 text-sm text-muted-foreground before:mr-2 before:font-bold before:text-primary before:content-['•']"
                    >
                      {question}
                    </li>
                  ))}
                </ul>
              </div>
            );
          } else if (item.type === "tool-call-chunk") {
            const data = JSON.parse(item.content);
            if (!data) return null;

            if (data.tool_call_name === "search_report_content") {
              const componentData: any = {
                queries: [],
                semantic_search_results: [],
              };

              componentData["queries"] =
                data?.tool_call_result?.data?.queries || [];

              componentData["semantic_search_results"] =
                data?.tool_call_result?.data?.semantic_search_results || [];

              return <SearchReportContent key={index} data={componentData} />;
            } else if (data.tool_call_name === "browse_report_catalog") {
              const componentData: any = {
                catalog_search_results: [],
              };

              componentData["catalog_search_results"] =
                data?.tool_call_result?.data?.catalog_search_results || [];

              return (
                <BrowseReportCatalog
                  key={index}
                  catalog_search_results={componentData.catalog_search_results}
                />
              );
            }
          }
        })}

        {/* Show current loader event if active */}
        {currentEvent?.event === "loader" && (
          <div className="mt-2 flex items-center gap-2">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              {currentEvent.data || "Processing..."}
            </span>
          </div>
        )}

        {/* Show current loader event if active */}
        {currentEvent?.event === "ping" && !chatFinished && (
          <div className="mt-2 flex items-center gap-2">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Processing...</span>
          </div>
        )}
      </>
    );
  };

  return (
    <div className={cn("flex gap-3 flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium md:h-10 md:w-10 md:text-base"
        )}
      >
        <Bot className="size-4 md:size-5" />
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "relative max-w-[85%] text-primary-dark rounded-lg px-3 py-2 md:max-w-[80%] md:px-4 md:py-3"
        )}
      >
        {renderContent()}
      </div>
    </div>
  );
};
