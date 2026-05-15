/**
 * Utility functions for section handling in RD pages
 */

export interface SectionBase {
  unique_key?: string;
  heading?: string;
}

export interface SegmentCount {
  current: number;
}

/**
 * Generates a unique section ID based on section data and segment count
 */
const generateSectionId = (
  section: SectionBase,
  segmentCount: SegmentCount
): string => {
  let sectionId = section.unique_key || "";

  if (section.heading?.toLowerCase().includes("segment")) {
    segmentCount.current += 1;
    sectionId = "segment_analysis";
  } else if (section.heading?.toLowerCase().includes("geograph")) {
    sectionId = "geography_analysis";
  } else if (!sectionId && section.heading) {
    sectionId = section.heading
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  return sectionId;
};

export default generateSectionId;
