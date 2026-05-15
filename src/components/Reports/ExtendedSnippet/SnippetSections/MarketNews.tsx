import React from "react";
import parse from "html-react-parser";

export interface MarketNewsData {
  heading?: string;
  auto_generated_text?: string;
  description?: string;
}

interface MarketNewsProps {
  data: MarketNewsData;
  id?: string;
}

const MarketNews: React.FC<MarketNewsProps> = ({ data, id }) => {
  const showSection =
    Boolean(data?.auto_generated_text) || Boolean(data?.description);

  if (!showSection) return null;

  const h2Styles: React.CSSProperties = {
    fontSize: "20px",
    lineHeight: "30px",
    color: "#195571",
    fontFamily: "sans-serif",
    fontWeight: 800,
    marginBottom: "12px",
    marginTop: "1rem",
  };

  const descriptionStyles: React.CSSProperties = {
    color: "#13293d",
    fontSize: "16px",
    lineHeight: "26px",
   fontFamily: "sans-serif",
    textAlign: "justify",
    marginTop: "10px",
  };

  return (
    <section
      id={id}
      className="w-full my-6 px-2 sm:px-0"
    >
      {data?.heading && <h2 style={h2Styles}>{data?.heading}</h2>}

      {data?.auto_generated_text && (
        <div style={descriptionStyles}>
          {parse(data?.auto_generated_text)}
        </div>
      )}

      {data?.description && (
        <div style={descriptionStyles}>
          {parse(data?.description)}
        </div>
      )}
    </section>
  );
};

export default MarketNews;
