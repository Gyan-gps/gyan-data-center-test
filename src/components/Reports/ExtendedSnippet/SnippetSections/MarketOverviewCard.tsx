import React from "react";

export interface MarketOverviewData {
  image?: { url: string; alt_text?: string }[];
  finalData?: { label: string; value: string | number }[];
  key_factors?: {
    type: string;
    value?: string | number | { url: string; alt_text?: string }[] | null;
    heading: string;
  }[];
}

interface Props {
  data: MarketOverviewData;
}

const MarketOverviewCard: React.FC<Props> = ({ data }) => {
  const styles = {
    marketOverviewContainer: {
      width: "100%",
      maxWidth: "500px",
      borderRadius: "0.5rem",
      overflow: "hidden",
      background: "white",
    },
    marketOverviewTitle: {
      padding: "0.75rem 0.5rem",
      fontSize: "14px",
      color: "#111827",
    },
    marketOverviewGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
    },
    marketOverviewRow: {
      display: "contents",
    },
    cellBase: {
      padding: "0.2rem 0.5rem",
      borderBottom: "1px solid #e5e7eb",
    },
    leftBase: {
      borderRight: "1px solid #e5e7eb",
      background: "#f9fafb",
    },
    labelStyle: {
      fontSize: "14px",
      color: "#3b82f6",
      fontWeight: "400",
    },
    valueStyle: {
      fontSize: "14px",
      color: "#111827",
      fontWeight: "400",
    },
  };

  return (
    <div
      className="
        w-full 
        md:rounded-lg bg-white 
        shadow-md border 
        p-4 md:p-6 
        mb-4 
      "
    >
      {/* Responsive Layout Flex → Stack on Mobile */}
      <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start w-full">

        {/* Image Section */}
        <div className="flex justify-center flex-1">
          <figure className="w-full max-w-xs md:max-w-sm">
            <img
              src={data.image?.[0]?.url}
              alt={data.image?.[0]?.alt_text || "Market Image"}
              className="w-full h-auto object-contain"
              loading="lazy"
            />
          </figure>
        </div>

        {/* Table Section */}
        <div className="flex-1 w-full">
          <div style={styles.marketOverviewContainer}>
            <div style={styles.marketOverviewTitle}>Market Overview</div>

            <div style={styles.marketOverviewGrid}>
              {data.finalData?.map((item, index) => {
                const isLast = index === data.finalData!.length - 1;

                return (
                  <div style={styles.marketOverviewRow} key={item.label}>
                    <div
                      style={{
                        ...styles.cellBase,
                        ...styles.leftBase,
                        borderBottom: isLast ? "none" : styles.cellBase.borderBottom,
                      }}
                    >
                      <span style={styles.labelStyle}>{item.label}</span>
                    </div>

                    <div
                      style={{
                        ...styles.cellBase,
                        borderBottom: isLast ? "none" : styles.cellBase.borderBottom,
                      }}
                    >
                      <span style={styles.valueStyle}>{item.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Factor Images */}
          {data.key_factors
            ?.filter(k => k.type === "images" && Array.isArray(k.value) && k.value[0]?.url)
            ?.map((k) => (
              <div
                key={k.heading}
                className="bg-white p-4 md:p-6 shadow-sm mt-4 w-full"
              >
                <h3 className="text-sm font-semibold text-gray-900 mb-2 text-center">
                  {k.heading}
                </h3>

                <img
                  src={Array.isArray(k.value) ? k.value[0]?.url : undefined}
                  alt={Array.isArray(k.value) && k.value[0]?.alt_text || k.heading}
                  className="w-full max-w-xs md:max-w-sm mx-auto"
                />

                <p className="text-[10px] text-gray-600 mt-1 text-center">
                  *Disclaimer: Major Players sorted in no particular order
                </p>
              </div>
            ))}
        </div>

      </div>
    </div>
  );
};

export default MarketOverviewCard;
