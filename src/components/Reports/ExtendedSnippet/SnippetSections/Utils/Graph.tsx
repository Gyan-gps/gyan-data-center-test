import React from "react";

export interface EmbedModalData {
  title?: string;
  slug?: string;
  shortTitle?: string;
  countryCode?: string;
}

interface GraphProps {
  url?: string;
  alt_text?: string;
  id?: string;
  note?: string;
  embedModalData?: EmbedModalData;
  noBorder?: boolean;
  unique_key?: string;
}

const Graph: React.FC<GraphProps> = ({
  url,
  alt_text,
  id = "",
  note,
  embedModalData,
}) => {
  const sectionId =
    id || `id_${Math.random().toString(36).substr(2, 9)}${Date.now()}`;

  return (
    <div
      id={sectionId}
      className={`m-0 mb-6 flex w-full flex-col items-center justify-center 
        bg-Primary-Mordor-Blue-Bg-50 p-3 shadow-rd 
        md:flex-row-reverse md:gap-4 md:bg-transparent md:p-0
        `}
    >
      {/* GRAPH IMAGE */}
      <div className="w-full md:flex-[0_1_70%] bg-white md:bg-transparent flex flex-col items-center justify-center">
        <figure className="relative w-full max-w-[700px]">
          <img
            className="w-full h-auto object-contain"
            title={alt_text}
            alt={alt_text}
            src={url}
            loading="lazy"
            data-embed="true"
            data-title={embedModalData?.title}
            data-slug={embedModalData?.slug}
            data-shorttitle={embedModalData?.shortTitle}
            data-countrycode={embedModalData?.countryCode}
            data-url={url}
          />
           <figcaption style={{alignContent: 'center', textAlign: 'center'}} className="py-3 text-Body-Regular-12 text-Neutrals-800 md:hidden">
              Image © Mordor Intelligence. Reuse requires attribution under CC
              BY 4.0.
            </figcaption>
        </figure>

        {note && (
          <p className="py-1 mt-2 text-[13px] text-gray-600 text-center">
            Note: {note}
          </p>
        )}
      </div>
    </div>
  );
};

export default Graph;
