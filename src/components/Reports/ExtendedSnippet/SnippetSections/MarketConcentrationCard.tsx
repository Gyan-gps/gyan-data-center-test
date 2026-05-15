import React from "react";

interface ConcentrationImage {
  url?: string;
  alt_text?: string;
}

interface MarketConcentrationData {
  image?: ConcentrationImage;
}

interface EmbedModalData {
  title?: string;
  slug?: string;
  shortTitle?: string;
  countryCode?: string;
}

interface MarketConcentrationCardProps {
  data: MarketConcentrationData;
  isMajorPlayers?: boolean;
  embedModalData?: EmbedModalData;
}

const MarketConcentrationCard: React.FC<MarketConcentrationCardProps> = ({
  data,
  isMajorPlayers = false,
  embedModalData,
}) => {
  return (
    <div
      id={isMajorPlayers ? "major-players" : ""}
      className="relative my-4 w-full flex flex-col items-center justify-center overflow-hidden rounded-lg border border-[#B5B5B5] shadow-rd"
    >
      <div className="z-10 w-full bg-[#F6FBFD] flex justify-center p-4">
        <figure className="relative w-full max-w-[700px]">
          <img
            title={data?.image?.alt_text || "Market Concentration"}
            alt={data?.image?.alt_text || "Market Concentration Image"}
            src={data?.image?.url}
            className="w-full h-auto object-contain"
            loading="lazy"
            data-embed="true"
            data-title={embedModalData?.title}
            data-slug={embedModalData?.slug}
            data-shorttitle={embedModalData?.shortTitle}
            data-countrycode={embedModalData?.countryCode}
            data-url={data?.image?.url}
          />
        </figure>
      </div>
    </div>
  );
};

export default MarketConcentrationCard;
