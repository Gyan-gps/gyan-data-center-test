import React from "react";
import MarketSegmentsExtended, {
  type MarketSegmentData, // reuse types from that component
} from "./MarketSegmentsExtended";

interface SectionItem extends MarketSegmentData {
  unique_key?: string;
  isEmptySection?: boolean;
}

interface MiddleSectionsProps {
  data: {
    new_description?: SectionItem[];
  };
  leftNavigationTabs: Record<string, number>;
  segmentCount: { current: number };
}


export const MiddleSections: React.FC<MiddleSectionsProps> = ({
  data
}) => {
  if (!Array.isArray(data.new_description)) return null;
  const keywordMappings = [
  {
    key: "segment_analysis",
    left_nav_heading: "Segment Analysis",
    keywords: ["segment analysis", "segmentation", "segment"],
  },
  {
    key: "geography_analysis",
    left_nav_heading: "Geography Analysis",
    keywords: ["geography", "geographical"],
  },
];
const normalize = (val) => val?.toLowerCase().trim() || "";
const matchKey = (item, mapping) => {
  if (!item) return false;
 
  const uniqueKey = normalize(item.unique_key);
  const navHeading = normalize(item.left_nav_heading);
  const heading = normalize(item.heading);
 
  //  Priority matching
  if (uniqueKey && uniqueKey === normalize(mapping.key)) return true;
 
  if (
    navHeading &&
    navHeading.includes(normalize(mapping.left_nav_heading))
  )
    return true;
 
  return mapping.keywords.some((kw) =>
    heading.includes(normalize(kw))
  );
};
const findIndex = (data, mapping) =>
  data?.findIndex((item) => matchKey(item, mapping)) ?? -1;
 
const sections = data?.new_description || [];
 
const segmentIndex = findIndex(sections, keywordMappings[0]);
const geographyIndex = findIndex(sections, keywordMappings[1]);
 
const hasSegment = segmentIndex !== -1;
const hasGeography = geographyIndex !== -1;

//  Nothing exists
if (!hasSegment && !hasGeography) return null;

let visibleSections = [];

//  Both exist  slice between them
if (hasSegment && hasGeography) {
  const start = Math.min(segmentIndex, geographyIndex);
  const end = Math.max(segmentIndex, geographyIndex);
  visibleSections = sections.slice(start, end + 1);
}

//  Only Segment exists
else if (hasSegment) {
  visibleSections = [sections[segmentIndex]];
}

//  Only Geography exists
else if (hasGeography) {
  visibleSections = [sections[geographyIndex]];
}

  return (
    <>
    {visibleSections.map((section, index) => {

        if (!section || !section.heading || section.isEmptySection) return null;

      const id = section.unique_key || `section-mid-${index}`;

        return (
          <section
            key={id}
            id={id}
            className="component"
          >
            <MarketSegmentsExtended
              data={section}
              unique_key={id}
            />
          </section>
        );
      })}
    </>
  );
};
