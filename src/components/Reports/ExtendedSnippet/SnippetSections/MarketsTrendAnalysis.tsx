/* eslint-disable complexity */
import React from "react";
import parse from "html-react-parser";
import ExtendedRdTable, { type SegmentTable } from "./Utils/ExtendedRdTable";
import Graph from "./Utils/Graph";

export interface MarketTrendData {
  heading?: string;
  subheading?: string;
  description?: string;
  auto_generated_text?: string;
  selected_indicators?: {
    subheading?: string;
    description?: string;
    image?: { url?: string; alt_text?: string }[];
  }[];
  image?: { url?: string; alt_text?: string }[];
  content?: {
    sub_heading?: string;
    description?: string;
    table?: SegmentTable;
    image?: { url?: string; alt_text?: string };
  }[];
}

interface Props {
  data: MarketTrendData;
   unique_key?: string;
}

const MarketsTrendAnalysis: React.FC<Props> = ({ data }) => {
    //checking and sanitizing the html to avoid any issues with tags in the description or auto_generated_text

  function sanitizeHtml(html) {
    if (!html) return html;

    return html
      .replace(/<sup([^>]*)>/g, "<sup>")
      .replace(/<sub([^>]*)>/g, "<sub>");
  }
  const isValidTableData = (table?: SegmentTable) =>
    table?.data?.some(row =>
      row.some(cell => String(cell ?? "").trim() !== "")
    );

  const hasListDeep = (node: React.ReactNode): boolean => {
    if (!node) return false;
    if (React.isValidElement(node) && (node.type === "ul" || node.type === "ol")) return true;
    if (Array.isArray(node)) return node.some(hasListDeep);
    return node.props?.children && hasListDeep(node.props.children);
  };

 const mainTitle = (text?: string) =>
  text && (
    <h2
      className="text-[20px] md:text-[22px] font-bold mt-4 mb-2 text-[#195571]"
      style={{ fontFamily: "sans-serif" }}
    >
      {text}
    </h2>
  );

const subTitle = (text?: string) =>
  text && (
    <h3
className="text-[18px] md:text-[20px] font-semibold mt-3 mb-1 text-black"
      style={{ fontFamily: "sans-serif" }}
    >
      {text}
    </h3>
  );

  const textBlock = (content?: string) => {
    if (!content) return null;
    const parsed = parse(sanitizeHtml(content));
    const hasList = hasListDeep(parsed);

    return (
      <div
        className="text-justify leading-[26px] text-[14px] md:text-[16px] mb-3"
        style={{ paddingLeft: hasList ? 12 : 0 }}
      >
        {parsed}
      </div>
    );
  };

  return (
    <section
      id="key-market-trends-download-sample"
      className="component w-full mt-6 md:mt-10"
    >
      {/* Heading */}
      {mainTitle(data?.heading)}

      {/* Auto-generated */}
      {textBlock(data?.auto_generated_text)}

      {/* Subheading */}
      {subTitle(data?.subheading)}

      {/* Description */}
      {textBlock(data?.description)}

      {/* Selected Indicators */}
      {data?.selected_indicators?.map((item, idx) => (
        <React.Fragment key={idx}>
          {subTitle(item.subheading)}
          {textBlock(item.description)}
          {item.image?.[0]?.url && (
            <Graph
              url={item.image[0].url}
              alt_text={item.image[0].alt_text}
            />
          )}
        </React.Fragment>
      ))}

      {/* Images */}
       {Array.isArray(data?.image) && data.image.length > 0 && (
      data?.image?.map(
        (img, idx) =>
          img.url && (
            <Graph key={idx} url={img.url} alt_text={img.alt_text} />
          ))
      )}

      {/* Content Sections */}
      {data?.content?.map((item, idx) => {
        const isSpecial =
          ["key report takeaways", "key report takeways", "other key industry trends covered in the report"]
            .includes(item.sub_heading?.toLowerCase().trim() || "");

        return (
          <div
            key={idx}
            className={`rounded-md p-0 md:p-0 ${
              isSpecial ? "bg-[#e6f4fe]" : ""
            }`}
          >
            {subTitle(item.sub_heading)}
            {textBlock(item.description)}
            {item.table?.heading && (
              <p className="mb-1 font-medium">{item.table.heading}</p>
            )}
            {item.table && isValidTableData(item.table) && (
              <ExtendedRdTable tableData={item.table} />
            )}
            {item?.image && item?.image?.url && (
              <Graph url={item.image.url} alt_text={item.image.alt_text} />
            )}
          </div>
        );
      })}
    </section>
  );
};

export default MarketsTrendAnalysis;
