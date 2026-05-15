import React from "react";
import Sidebar from "./Sidebar"

import type { ReportExtendedData } from "@/network/datacenter/datacenter.types";

import MarketSize from "./SnippetSections";
import MarketSegmentsExtended from "./SnippetSections/MarketSegmentsExtended";
import MarketsTrendAnalysis from "./SnippetSections/MarketsTrendAnalysis";
import { MiddleSections } from "./SnippetSections/MiddleSections";
import MarketIndustryOverview from "./SnippetSections/MarketIndustryOverview";
import MarketLeaders from "./SnippetSections/MarketLeaders";
import MarketNews from "./SnippetSections/MarketNews";
import TableOfContents from "./SnippetSections/TOC";
// import RenewDrawer from "../../Common/RenewDrawer";

interface SnippetProps {
  snippetData: ReportExtendedData;
  slug?: string;
  fetchReport?: () => void;
}

const Snippet: React.FC<SnippetProps> = ({
  snippetData,
}) => {
  const segmentCount = { current: 0 };

  return (
<div className="w-full flex justify-center px-2 sm:px-4">
  <div className="w-full max-w-[1400px] flex flex-col lg:flex-row gap-6 items-start">
    
    {/* Sidebar */}
    <aside className="hidden lg:block w-[260px] flex-shrink-0 sticky top-[80px] self-start max-h-[calc(100vh-80px)] overflow-y-auto">
      <Sidebar leftNavData={snippetData.leftNavData} />
    </aside>
        {/* Main Content */}
        <main className="flex-1 space-y-10">
          {snippetData?.market_size  && (
            <section id="market_snapshot">
              <MarketSize data={snippetData?.market_size} />
            </section>
          )}

          {snippetData?.market_analysis && (
            <section id="market_overview">
              <MarketSegmentsExtended
                unique_key="market_overview"
                data={snippetData?.market_analysis}
              />
            </section>
          )}

          {snippetData?.market_trends && (
            <section id="key_market_trends">
              <MarketsTrendAnalysis
                unique_key="key_market_trends"
                data={snippetData?.market_trends}
              />
            </section>
          )}

          <MiddleSections
            data={snippetData}
            leftNavigationTabs={snippetData?.left_navigation_tabs}
            segmentCount={segmentCount}
          />

          {(snippetData?.market_landscape && !snippetData?.market_landscape?.isEmptySection) && (
            <MarketIndustryOverview
              id="competitive_landscape"
              isMajorPlayers
              data={snippetData?.market_landscape}
            />
          )}

          {snippetData?.market_leaders && (
            <MarketLeaders
              id="major_players"
              data={snippetData?.market_leaders}
            />
          )}

          {snippetData?.market_news && (
            <section id="recent_developments">
              <MarketNews data={snippetData?.market_news} />
            </section>
          )}

          <section id="table-of-content">
            <TableOfContents TOCData={snippetData?.TOCData} />
          </section>
        </main>

      </div>
    </div>
  );
};

export default Snippet;
