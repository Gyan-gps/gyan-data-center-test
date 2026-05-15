import React from "react";
import { transformTOC } from "./RDTocTable";

export interface TOCNode {
  number?: string;
  text: string;
  children?: TOCNode[];
}

interface TocTableProps {
  toc?: any;
  tocDisclaimer?: (string | boolean | null)[];
  lang?: string;
  handleTocClick?: () => void;
}

const renderChildren = (children: TOCNode[] = [], lang: string = "en") => {
  if (!children.length) return null;

  return (
    <ul className="pl-4 md:pl-6 list-disc space-y-1">
      {children.map((child, index) => (
        <React.Fragment key={index}>
          <li className="flex gap-2 items-start text-[14px] md:text-[15px] leading-[22px] text-[#13293d]">
            <span className="min-w-[28px] text-[#195571] font-medium">
              {child.number}
            </span>
            <span className="flex-1 break-words">{child.text}</span>
          </li>

          {/* Recursive children */}
          {child.children && (
            <div className="ml-4 md:ml-6">
              {renderChildren(child.children, lang)}
            </div>
          )}

          {child.text.trim().toLowerCase() === "company profiles" && (
            <li className="text-xs md:text-sm text-gray-700 mt-2 ml-4">
              *List Not Exhaustive
            </li>
          )}
        </React.Fragment>
      ))}
    </ul>
  );
};

const TocTable: React.FC<TocTableProps> = ({
  toc,
  tocDisclaimer,
  lang = "en",
  handleTocClick = () => {},
}) => {
  const transformed: TOCNode[] = transformTOC(toc);

  return (
    <div
      id="table-of-content-container"
      className="mt-6 break-words"
      onClick={handleTocClick}
    >
      {transformed.map((section, index) => (
        <React.Fragment key={index}>
          {/* Section Heading */}
          <p className="w-full border-b border-[#C0E3F1] bg-[#e8f2fa] px-3 py-2 md:px-5 text-[15px] md:text-[16px] font-semibold text-[#195571]">
            {`${section.number}. ${section.text}`}
          </p>

          {/* Sub Items */}
          <div className="px-2 md:px-4">
            {renderChildren(section.children, lang)}
          </div>

          {section.text.trim().toLowerCase() === "company profiles" && (
            <strong className="block text-xs md:text-sm text-gray-700 mt-2 ml-4">
              *List Not Exhaustive
            </strong>
          )}
        </React.Fragment>
      ))}

      {/* Disclaimers */}
      {tocDisclaimer?.[2] && (
        <div className="mt-3 text-xs md:text-sm font-medium text-gray-700">
          **Subject to Availability
        </div>
      )}

      {tocDisclaimer?.[3] && (
        <div className="mt-1 text-xs md:text-sm font-medium text-gray-700">
          {tocDisclaimer[3]}
        </div>
      )}
    </div>
  );
};

export default TocTable;
