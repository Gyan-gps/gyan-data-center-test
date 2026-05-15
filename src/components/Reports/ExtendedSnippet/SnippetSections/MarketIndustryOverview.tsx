import React from "react";
import Graph from "./Utils/Graph";
import parse from "html-react-parser";
import MarketConcentrationCard from "./MarketConcentrationCard";

interface IndustryImage {
  url?: string;
  alt_text?: string;
  reseller_url?: string;
}

interface IndustryContentItem {
  sub_heading?: string;
  description?: string;
  image?: IndustryImage;
}

export interface MarketIndustryData {
  heading?: string;
  auto_generated_text?: string;
  image?: IndustryImage |IndustryImage[];
  content?: IndustryContentItem[];
}

interface MarketIndustryOverviewProps {
  data: MarketIndustryData;
  id?: string;
  isMajorPlayers?: boolean;
  onlyMajorsPlayers?: boolean;
}

const MarketIndustryOverview: React.FC<MarketIndustryOverviewProps> = ({
  data,
  id,
  isMajorPlayers = false,
  onlyMajorsPlayers,
}) => {
  return (
    <section
      id={id}
      className="w-full px-3 md:px-0 my-6 md:my-10"
      style={{ maxWidth: "100%" }}
    >
      {/* Heading */}
      {data?.heading && (
        <h2 className="text-[18px] md:text-[20px] font-bold text-[#195571] mb-3">
          {data?.heading}
        </h2>
      )}

      {/* Major players card / chart */}
      {data?.image && data?.image?.url && (
        <div className="w-full flex justify-center md:justify-start overflow-hidden">
          <MarketConcentrationCard
            isMajorPlayers={isMajorPlayers}
            data={{
              ...data,
              image: Array.isArray(data.image) ? data.image[0] : data.image,
            }}
          />
        </div>
      )}

      {/* Auto-generated text */}
      {!onlyMajorsPlayers && data?.auto_generated_text && (
        <p className="text-[14px] md:text-[16px] leading-[26px] text-justify mt-3">
          {parse(data?.auto_generated_text)}
        </p>
      )}

      {/* Content items */}
      {!onlyMajorsPlayers &&
      data.content &&
          data.content.length &&
        data?.content?.map((item, index) => (
          <div key={index} className="mt-5">
            {item?.sub_heading && (
              <p className="text-[16px] font-semibold mb-2">
                {item?.sub_heading}
              </p>
            )}
            {item?.description && (
              <div className="text-[14px] md:text-[16px] leading-[26px] text-justify">
                {parse(item?.description)}
              </div>
            )}

            {/* Graph Below */}
            {item?.image && item?.image?.url && (
              <div className="mt-3 w-full">
                <Graph
                  url={item.image.url}
                  alt_text={item.image.alt_text}
                  noBorder={true}
                />
              </div>
            )}
          </div>
        ))}
    </section>
  );
};

export default MarketIndustryOverview;
