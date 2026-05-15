import React, { useRef } from "react";
import TocTable from "./TocTable";


interface TOCContent {
  new_toc_disclaimer?: (string | boolean | null)[]
}

export interface TOCTableRow {
  text: string;
  parent: string | null;
  tags: string[];
  list: unknown[];
  location: string;
}

export interface TOCDataType {
  heading?: string;
  tableData?: TOCTableRow[];
  content?: TOCContent;
}

interface TableOfContentsProps {
  TOCData?: TOCDataType;
}


const TableOfContents: React.FC<TableOfContentsProps> = ({ TOCData }) => {
  const tocSectionRef = useRef<HTMLElement | null>(null);

  const h2Styles: React.CSSProperties = {
    fontSize: "20px",
    lineHeight: "30px",
    color: "#195571",
    fontFamily: "sans-serif",
    fontWeight: 800,
    marginBottom: "10px",
    marginTop: "1rem",
  };

  return (
    <section id="table-of-content" ref={tocSectionRef}>
      <h2 style={h2Styles}>
        {TOCData?.heading || "Table of Contents"}
      </h2>

      <TocTable
        toc={TOCData?.tableData}
        tocDisclaimer={TOCData?.content?.new_toc_disclaimer}
      />
    </section>
  );
};

export default TableOfContents;
