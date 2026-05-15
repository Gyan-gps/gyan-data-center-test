import React, { useState, useEffect, useRef } from "react";
import parse, { domToReact } from "html-react-parser";
import { useReactToPrint } from "react-to-print";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import PrintIcon from '../../../../assets/print_icon2.svg';
import Snippet from "./Snippet";
import _ from "lodash";

interface Props {
  data: any[];
  snippetData: any;
}

const ExecSummary: React.FC<Props> = ({ data, snippetData }) => {
  const [execSummaryData, setExecSummaryData] = useState<any[]>([]);

  const KeyFindingsRef = useRef<HTMLDivElement | null>(null);
  const AnalystsNoteRef = useRef<HTMLDivElement | null>(null);

  const [currentResearch, setCurrentResearch] = useState("Key Findings");
  const [expandedAccordions, setExpandedAccordions] = useState<Record<number, boolean>>({});
  const [expandAll, setExpandAll] = useState(true);

  const extractTableData = (children: any) => {
    let rowsData: any[] = [];
    children.forEach((tr: any) => {
      if (tr.name === "tr") {
        let rowData: any = {};
        tr.children.forEach((td: any, index: number) => {
          if (td.name === "td" || td.name === "th") {
            rowData[`column${index}`] = domToReact(td.children);
          }
        });
        rowsData.push(rowData);
      }
    });
    return rowsData;
  };

  useEffect(() => {
    if (!data) return;

    const newData = data.map((item) => {
      if (typeof item.content === "string") {
        parse(item.content, {
          replace: ({ name, children }: any) => {
            if (name === "table") {
              const tableData = extractTableData(children);
              return { ...item, tableData };
            }
          },
        });
      }
      return item;
    });

    setExecSummaryData(newData);
  }, [data]);

  useEffect(() => {
    if (Object.values(expandedAccordions).every((val) => val === true)) {
      setExpandAll(true);
    } else if (Object.values(expandedAccordions).every((val) => val === false)) {
      setExpandAll(false);
    }
  }, [expandedAccordions]);

  useEffect(() => {
    const allState = execSummaryData.reduce((acc: any, _, index: number) => {
      acc[index] = expandAll;
      return acc;
    }, {});
    setExpandedAccordions(allState);
  }, [expandAll, execSummaryData]);

  const handleAccordionChange = (index: number) => {
    setExpandedAccordions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const printExecSummary = useReactToPrint({
    content: () =>
      currentResearch === "Key Findings"
        ? KeyFindingsRef.current
        : AnalystsNoteRef.current,
  });

  return (
    <Box sx={styles.container}>

      {/*  CSS INSIDE FILE */}
      <style>
        {`
        .report-content {
          padding: 0 clamp(12px, 3vw, 24px);
        }

        .report-content p {
          margin-block: 1rem;
          color: rgb(90, 90, 90);
          font-size: 16px;
          line-height: 1.6rem;
          letter-spacing: 0.17px;
          padding: 0 0.5rem;
          text-align: justify;
        }

        .report-content ul,
        .report-content ol {
          margin-inline-start: 2rem;
          margin-block: 1rem;
        }

        .report-content li {
          margin-block: 0.5rem;
          line-height: 1.6rem;
        }

        .report-content h3 {
          font-weight: 700;
          margin-block: 1rem;
          padding: 0 0.5rem;
        }

        .report-content table {
          border-collapse: collapse;
          width: 100%;
          border: 1px solid #ECECEC;
          border-radius: 8px;
          overflow: hidden;
          margin-block: 1rem;
        }

        .report-content thead {
          border-bottom: 1px solid #ECECEC;
        }

        .report-content th,
        .report-content td {
          padding: 8px;
          border-right: 1px solid #ECECEC;
        }

        .report-content tbody tr:nth-child(even) {
          background-color: rgb(240, 247, 252);
        }
        `}
      </style>

      {/* HEADER */}
      <Box sx={styles.header}>
        <Box sx={styles.leftControls}>
          {currentResearch === "Key Findings" && (
            <Button onClick={() => setExpandAll(!expandAll)} variant="outlined">
              {expandAll ? <RemoveIcon /> : <AddIcon />}
            </Button>
          )}

          <Box sx={styles.tabs}>
            <Button
              variant={currentResearch === "Key Findings" ? "contained" : "text"}
              onClick={() => setCurrentResearch("Key Findings")}
            >
              Key Findings
            </Button>

            <Button
              variant={currentResearch === " Analyst’s Note" ? "contained" : "text"}
              onClick={() => setCurrentResearch(" Analyst’s Note")}
            >
              Analyst’s Note
            </Button>
          </Box>
        </Box>

        <Button onClick={printExecSummary} variant="outlined">
          <img src={PrintIcon} width="20" />
        </Button>
      </Box>

      {/* CONTENT */}
      {currentResearch === "Key Findings" ? (
        <Box>
          {execSummaryData?.map((item, index) => (
            <Box key={_.uniqueId()} sx={styles.infoContainer}>
              <Accordion
                expanded={expandedAccordions[index] || false}
                onChange={() => handleAccordionChange(index)}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={styles.summary}
                >
                  <Typography sx={styles.heading}>
                    {item.heading}
                  </Typography>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 0 }}>
                  <Box sx={styles.contentWrapper}>
                    <div style={styles.content} className="report-content">
                      {parse(item.content)}
                    </div>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Box>
          ))}
        </Box>
      ) : (
        <Snippet data={snippetData} />
      )}
    </Box>
  );
};

export default ExecSummary;

const styles = {
  container: {
    width: "100%",
    maxWidth: "100%",
    p: "clamp(8px,2vw,16px)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
  },

  leftControls: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },

  tabs: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  infoContainer: {
    marginBlock: "clamp(12px,2vw,20px)",
  },

  heading: {
    color: "#449ac6",
    fontWeight: 700,
    fontSize: "clamp(14px,2vw,18px)",
  },

  contentWrapper: {
    overflowX: "auto",
  },

  content: {
    fontSize: "clamp(14px,1.8vw,16px)",
    lineHeight: "1.6rem",
    color: "#5a5a5a",
    textAlign: "justify",
  },
  summary: {
    backgroundColor: "#f0f7fc",   //  light blue
    borderRadius: "8px",
    minHeight: "48px",
    "&.Mui-expanded": {
      minHeight: "48px",
    },
    "& .MuiAccordionSummary-content": {
      margin: "8px 0",
    },
  },
};