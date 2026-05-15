/* eslint-disable complexity */
import React from "react";
import ExtendedRdTable from "./Utils/ExtendedRdTable";
import Graph from "./Utils/Graph";
import parse from "html-react-parser";

export interface SegmentImage {
  url?: string;
  alt_text?: string;
  reseller_url?: string;
  note_checkbox?: boolean;
  note?: string;
  mobileUrl?: string;
}

export interface SegmentTable {
  heading?: string;
  data: (string | number | null)[][];
}

export interface SegmentContent {
  sub_heading?: string;
  description?: string;
  table?: SegmentTable;
  image?: SegmentImage;
}

export interface MarketSegmentData {
  heading?: string;
  auto_generated_text?: string;
  description?: string;
  content?: SegmentContent[];
  unique_key?: string;
}

interface Props {
  data: MarketSegmentData;
  id?: string;
  bgColor?: string;
  unique_key?: string;
}

const MarketSegmentsExtended: React.FC<Props> = ({
  data,
  id,
  bgColor,
  unique_key,
}) => {
  const isMobile = false;

  const paragraphStyles: React.CSSProperties = {
    color: "#13293d",
    fontSize: "1rem",
    lineHeight: "26px",
    fontFamily: "sans-serif",
    wordBreak: "break-word",
    fontWeight: 400,
    textAlign: "justify",
    marginBottom: "10px",
  };

  const descriptionWrapperStyles: React.CSSProperties = {
    lineHeight: "26px",
    textAlign: "justify",
  };

  const h2Styles: React.CSSProperties = {
    fontSize: "20px",
    lineHeight: "30px",
    color: "#195571",
    fontFamily: "sans-serif",
    fontWeight: 800,
    marginBottom: "10px",
    marginTop: "1rem",
  };

  const isValidTableData = (table?: SegmentTable) => {
    if (!table?.data?.length) return false;
    return table.data.some(row =>
      row.some(cell => String(cell || "").trim() !== "")
    );
  };

  return (
    <section
      id={id}
      className="m-0 mt-6 w-full p-0 md:mt-10"
    >
      {data?.heading && (
        <h2 className="font-semibold text-[20px] md:text-[22px]" style={h2Styles}>
          {data?.heading}
        </h2>
      )}

      {data?.auto_generated_text && (
        <p style={paragraphStyles}>{data?.auto_generated_text}</p>
      )}

      {data?.description && (() => {
        const parsedContent = parse(data?.description);

        // Check if description has any <ul> element
        const hasList =
          Array.isArray(parsedContent) &&
          parsedContent.some(
            item =>
              item?.$$typeof === Symbol.for('react.element') &&
              item.type === 'ul'
          );

        return (
          <div
            style={{
              ...descriptionWrapperStyles,
              paddingLeft: hasList ? "20px" : "0px",
            }}
          >
            {parsedContent}
          </div>
        );
      })()}

      {data?.content?.map((item, index) => {
        if (!item?.description) return null;
        const tableData = item?.table;
        const isTableExists =tableData && isValidTableData(tableData);
        const note = item.image?.note_checkbox ? item.image?.note ?? "" : "";
        const graphURL = isMobile ? item.image?.mobileUrl ?? item.image?.url : item.image?.url;

        const isTakeaways =
          item?.sub_heading?.toLowerCase().trim() === "key report takeaways" ||
          item?.sub_heading?.toLowerCase().trim() === "key report takeways" ||
          item?.sub_heading?.toLowerCase().trim() ===
            "other key industry trends covered in the report";

        return (
          <div
            key={index}
            className={`w-full my-6 ${
              isTakeaways ? `rounded-xl ${bgColor || "bg-[#e6f4fe]"} p-4` : ""
            }`}
          >
            {item?.description && item?.sub_heading && (
              <p
                className="text-lg font-semibold mb-2"
                style={{ ...paragraphStyles, fontSize: "18px", fontWeight: 600 }}
              >
                {item?.sub_heading}
              </p>
            )}

            {item?.description && (
              
              <div style={descriptionWrapperStyles}>
                {item.description.includes("<ul") ? (
                  <div
                    style={{
                      ...paragraphStyles,
                    }}
                  >
                    <style>
                                  {`
                  .parsed-description ul {
                    list-style-type: disc !important;
                    list-style-position: outside; /* ✔ Fix spacing */
                    padding-left: 16px; /* ✔ Better alignment */
                    margin-left: 0;
                  }
                  .parsed-description li {
                    margin: 0 0 6px 0; /* Optional: small gap between points */
                  }
                `}
                    </style>

                    <div className="parsed-description">
                      {parse(item.description)}
                    </div>
                  </div>
                ) : (
                  <p style={paragraphStyles}>{parse(item.description)}</p>
                )}
              </div>
              
            )}

            {tableData?.heading && (
              <p className="mt-2 mb-1" style={paragraphStyles}>
                {tableData?.heading || ""}
              </p>
            )}

            {isTableExists && (
              <div className="mt-3 mb-6 w-full overflow-x-auto">
                <ExtendedRdTable tableData={tableData!} />
              </div>
            )}

            { item?.image && item?.image.url && (
              <div className="w-full mt-4">
                <Graph
                  url={graphURL}
                  alt_text={item.image.alt_text}
                  note={note}
                  unique_key={unique_key}
                />
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
};

export default MarketSegmentsExtended;
