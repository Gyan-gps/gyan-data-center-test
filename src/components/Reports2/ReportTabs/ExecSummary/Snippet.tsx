import React, { useState, useEffect } from "react";
import parse from "html-react-parser";

type SnippetItem = {
  heading: string;
  content: string;
};

type Props = {
  data: SnippetItem[];
};

const Snippet: React.FC<Props> = ({ data }) => {
  const [snippetData, setSnippetData] = useState<SnippetItem[]>([]);

  useEffect(() => {
    if (!data) return;
    setSnippetData(data);
  }, [data]);

  return (
    <div style={styles.container}>

      {/* INTERNAL CSS (handles parsed HTML) */}
      <style>
        {`
        .snippet-content {
          padding: 0 clamp(12px, 3vw, 32px);
        }

        /* Paragraphs */
        .snippet-content p {
          margin: 1rem 0;
          color: rgb(90, 90, 90);
          font-size: 16px;
          line-height: 1.6rem;
          letter-spacing: 0.17px;
          text-align: justify;
        }

        /* Lists */
        .snippet-content ul,
        .snippet-content ol {
          margin: 1rem 0 1rem 1.5rem;
        }

        .snippet-content li {
          margin: 0.5rem 0;
          line-height: 1.6rem;
        }

        /* SECTION HEADINGS (Drivers, Challenges, etc.) */
        .snippet-content h3 {
          font-weight: 700;
          font-size: 16px;
          margin: 1.5rem 0 0.5rem 0;
          padding: 8px 12px;
          background-color: #f0f7fc;
          border-left: 4px solid #449ac6;
          border-radius: 4px;
          color: #1f2937;
        }

        /* Optional h2 styling (if comes inside content) */
        .snippet-content h2 {
          font-size: 18px;
          font-weight: 700;
          margin: 1.5rem 0 0.8rem 0;
        }

        /* Tables */
        .snippet-content table {
          border-collapse: collapse;
          width: 100%;
          border: 1px solid #ECECEC;
          border-radius: 8px;
          overflow: hidden;
          margin: 1rem 0;
        }

        .snippet-content th,
        .snippet-content td {
          padding: 8px;
          border-right: 1px solid #ECECEC;
        }

        .snippet-content thead {
          border-bottom: 1px solid #ECECEC;
          font-weight: 600;
        }

        .snippet-content tbody tr:nth-child(even) {
          background-color: rgb(240, 247, 252);
        }
        `}
      </style>

      {snippetData.map((item, index) => (
        <div key={index} style={styles.infoContainer}>
          <h2 style={styles.heading}>{item.heading}</h2>

          <div style={styles.contentWrapper}>
            <div style={styles.content} className="snippet-content">
              {parse(item.content)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Snippet;

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    maxWidth: "100%",
    padding: "clamp(12px,2vw,24px)",
  },

  infoContainer: {
    marginBlock: "clamp(16px,2vw,32px)",
  },

  heading: {
    color: "#449ac6",
    fontSize: "clamp(16px,2vw,20px)",
    fontWeight: 700,
    margin: "0.8rem 0",
  },

  contentWrapper: {
    overflowX: "auto",
  },

  content: {
    color: "rgb(90,90,90)",
    fontSize: "clamp(14px,1.8vw,16px)",
    lineHeight: "1.6rem",
    margin: "0.5rem 0", //  removed side margin
    wordBreak: "break-word",
  },
};