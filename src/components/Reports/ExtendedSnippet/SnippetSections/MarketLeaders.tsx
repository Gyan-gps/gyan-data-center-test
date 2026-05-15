import React from "react";

// ---------- TYPES ----------
interface LeaderItem {
  title?: string;
}

interface LeaderList {
  value?: LeaderItem[];
}

export interface MarketLeadersData {
  heading?: string;
  list?: LeaderList;
}

interface MarketLeadersProps {
  data: MarketLeadersData;
  id?: string;
}

const MarketLeaders: React.FC<MarketLeadersProps> = ({ data, id }) => {
  const leaders = data?.list?.value || [];

  if (!leaders.length) return null;

  return (
    <section id={id} className="w-full mt-6 md:mt-10 px-2 sm:px-3">
      <div className="w-full max-w-4xl mx-auto border border-[#B5B5B5] rounded-lg shadow bg-white overflow-hidden">
        {/* Header */}
        <div className="bg-[#D5EDF6] px-4 py-3 md:py-4">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-[#195571] leading-tight">
            {data?.heading}
          </h2>
        </div>

        {/* Grid list – NO horizontal scrolling */}
        <div className="bg-[#F6FBFD] px-3 py-4">
          <div
            className="
              grid gap-3 sm:gap-4
              grid-cols-2
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-5
            "
          >
            {leaders.map((item, index) => (
              <div
                key={index}
                className="
                  flex flex-col items-center justify-center
                  bg-white shadow rounded-lg
                  px-3 py-4
                  min-h-[90px]
                "
              >
                {/* Rank badge */}
                <div
                  className="
                    w-[26px] h-[26px] sm:w-[30px] sm:h-[30px]
                    rounded-full bg-[#195571] text-white
                    flex items-center justify-center
                    mb-1.5 text-xs sm:text-sm font-bold
                  "
                >
                  {index + 1}
                </div>

                {/* Title */}
                <p className="text-center text-xs sm:text-sm md:text-base text-[#333] font-medium break-words">
                  {item?.title?.trim() || ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketLeaders;
