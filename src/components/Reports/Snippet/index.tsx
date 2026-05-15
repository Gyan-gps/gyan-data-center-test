import React, { useState, useEffect, useCallback } from "react";
import ParsedReportPage from "./ReportParser";
import { Loading } from "@/components/ui";

interface SnippetData {
  data: string;
  template?: string;
}

interface SnippetProps {
  snippetData?: SnippetData | string;
}

function Snippet({ snippetData }: SnippetProps) {
  const [htmlReportPage, setHtmlReportPage] = useState<string>("");
  const [template, setTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean | "PENDING">("PENDING");
  const fetchReportHtml = useCallback(() => {
    setLoading("PENDING");

    try {
      if (typeof snippetData === "string") {
        setHtmlReportPage(snippetData);
        setTemplate(null);
      } else {
        setHtmlReportPage(snippetData?.data || "");
        setTemplate(snippetData?.template || null);
      }
    } catch (error) {
      console.error(error);
      setHtmlReportPage(`<div style="width:100%; height:50vh; display:flex; justify-content:center; align-items: center">
        <h1>Snippet not found for this report</h1>
      </div>`);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [snippetData]);

  useEffect(() => {
    if (!snippetData) return;
    fetchReportHtml();
  }, [snippetData, fetchReportHtml]);

  return (
    <>
      <div style={{ display: loading === "PENDING" ? "block" : "none" }}>
        <ReportPageLoadingSection />
      </div>
      <div style={{ display: loading === "PENDING" ? "none" : "block" }}>
        {htmlReportPage && (
          <ParsedReportPage HTML={htmlReportPage} template={template} />
        )}
      </div>
    </>
  );
}

export default Snippet;

const ReportPageLoadingSection: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "468px",
        width: "100%",
      }}
    >
      <Loading />
    </div>
  );
};
