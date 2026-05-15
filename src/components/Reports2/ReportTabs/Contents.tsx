import React, { useEffect, useState } from "react";

type Section = {
  title: string;
  subSections?: Section[];
  meta?: {
    slideNumber?: number;
  };
};

type Props = {
  data: Section[];
    setSelectedSlide: (slide: number) => void;
  setCurrentTab: (tab: string) => void;
};

const Contents: React.FC<Props> = ({
  data,
  setSelectedSlide,
  setCurrentTab,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!data) return;

    const expandAllSections = (
      sections: Section[],
      parentIndex = ""
    ): Record<string, boolean> => {
      let expanded: Record<string, boolean> = {};

      sections.forEach((section, index) => {
        const currentIndex = `${parentIndex}${index + 1}`;
        expanded[currentIndex] = true;

        if (section.subSections?.length > 0) {
          expanded = {
            ...expanded,
            ...expandAllSections(section.subSections, `${currentIndex}.`),
          };
        }
      });

      return expanded;
    };

    setExpandedSections(expandAllSections(data));
  }, [data]);

  const toggleSection = (indexPath: string, slideNumber?: number) => {
    if (slideNumber) {
      setSelectedSlide(slideNumber - 1);
      setCurrentTab("report");
      return;
    }

    setExpandedSections((prev) => ({
      ...prev,
      [indexPath]: !prev[indexPath],
    }));
  };

  if (!data || data.length === 0) return <div>No Data Found</div>;

  const renderSections = (
    sections: Section[],
    parentIndex = ""
  ): React.ReactNode =>
    sections.map((section, index) => {
      const currentIndex = `${parentIndex}${index + 1}`;
      const isExpanded = expandedSections[currentIndex];

      return (
        <div key={currentIndex} style={styles.section}>
          <div
            style={{
              ...styles.sectionTitle,
              ...(parentIndex
                ? styles.subsectionTitle
                : styles.mainSectionTitle),
            }}
            onClick={() =>
              toggleSection(currentIndex, section.meta?.slideNumber)
            }
          >
            {currentIndex}. {section.title}
          </div>

          {/*  FIXED */}
          {section.subSections?.length > 0 && isExpanded && (
            <div style={styles.subsections}>
              {renderSections(section.subSections, `${currentIndex}.`)}
            </div>
          )}
        </div>
      );
    });

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Table of Contents</h2>
      <div>{renderSections(data)}</div>
    </div>
  );
};

export default Contents;

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "clamp(8px, 2vw, 16px)",
    width: "100%",
  },

  title: {
    color: "#449ac6",
    fontSize: "clamp(16px, 2vw, 20px)",
    fontWeight: 700,
    marginBottom: "12px",
  },

  section: {
    marginLeft: "clamp(8px, 2vw, 12px)", //  responsive indent
  },

  sectionTitle: {
    backgroundColor: "rgb(240, 247, 252)",
    color: "#449ac6",
    cursor: "pointer",
    margin: "4px 0",
    fontSize: "clamp(13px, 1.6vw, 15px)",
    padding: "6px 10px",
    borderRadius: "6px",
    transition: "all 0.2s ease",
    wordBreak: "break-word", //  prevents overflow
  },

  mainSectionTitle: {
    fontWeight: 600,
    color: "#1a202c",
  },

  subsectionTitle: {
    backgroundColor: "#fff",
    color: "#4a5568",
  },

  subsections: {
    marginLeft: "clamp(8px, 2vw, 12px)",
  },
};