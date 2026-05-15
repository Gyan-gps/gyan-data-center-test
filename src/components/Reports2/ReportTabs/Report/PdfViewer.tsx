import React, { useState, useEffect } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { pdfjs } from "react-pdf";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";


pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

type Props = {
  fileUrl: string;
  allowDownload?: boolean;
  selectedSlide?: number | null;
};
// const getPdfUrlUnSigned = (pdfUrl: string) => {
//   const pdfUrlWithoutQuery = pdfUrl?.split("?")[0];
//   if (!pdfUrlWithoutQuery) return pdfUrl;
//   return pdfUrlWithoutQuery;
// };


const getModifiedUrl = (fileUrl: string) => {
  if (!fileUrl) return fileUrl;
  return fileUrl;
  if(fileUrl.includes("lorien-live-reports.s3.us-west-2.amazonaws.com")) {
    return fileUrl.replace(
      "lorien-live-reports.s3.us-west-2.amazonaws.com",
      "lorien-live.mordorintelligence.com"
    );
  } else if(fileUrl.includes("synapse-cms-prod.s3.us-west-2.amazonaws.com")) {
    return fileUrl.replace(
      "synapse-cms-prod.s3.us-west-2.amazonaws.com",
      "synapse-files.mordorintelligence.com"
    );
  } else {
    return fileUrl;
  }
}

const PdfViewer: React.FC<Props> = ({ fileUrl, allowDownload,  selectedSlide, }) => {
  const licenseKey = import.meta.env.VITE_REACT_PDF_VIEWER_LICENSE_KEY as string;

  const transform = (slot: any) => ({
    ...slot,
    Download: allowDownload ? slot.Download : () => <></>,
    DownloadMenuItem: allowDownload ? slot.DownloadMenuItem : () => <></>,
    Print: allowDownload ? slot.Print : () => <></>,
    Open: () => <></>,
    EnterFullScreenMenuItem: () => <></>,
  });


  // const [defaultScale] = useState<number>(1.25);
  const [modifiedFileUrl, setModifiedFileUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const renderToolbar = (Toolbar: any) => (
    <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
  );

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar,
    // defaultScale: "PageFit",
  });

  const { renderDefaultToolbar } =
    defaultLayoutPluginInstance.toolbarPluginInstance;

  const handleDoc = () => {
    const { activateTab } = defaultLayoutPluginInstance;
    activateTab(0);
  };

  useEffect(() => {
  if (
    selectedSlide !== null &&
    selectedSlide !== undefined
  ) {
    setCurrentPage(selectedSlide);
  }
}, [selectedSlide]);

  useEffect(() => {
  if (!fileUrl) return;

  // const unsignedUrl = getPdfUrlUnSigned(fileUrl);
  const modified = getModifiedUrl(fileUrl);

  setModifiedFileUrl(modified);
}, [fileUrl]);
if (!modifiedFileUrl) {
  return <div style={{ padding: "20px" }}>Loading PDF...</div>;
}

  return (
   
      <Worker workerUrl={pdfjs.GlobalWorkerOptions.workerSrc}>
      <div style={styles.outer}>
        <div style={styles.viewerWrapper}>
          <div style={styles.viewerInner}>
            <Viewer
              theme="dark"
              key={`${modifiedFileUrl}-${currentPage}`}
              fileUrl={modifiedFileUrl}
              plugins={[defaultLayoutPluginInstance]}
              licenseKey={licenseKey}
              defaultScale="PageFit"
              onDocumentLoad={handleDoc}
             initialPage={currentPage}
            />
          </div>
        </div>
      </div>
    </Worker>
  );
};

export default PdfViewer;

const styles: Record<string, React.CSSProperties> = {
  outer: {
    width: "100%",
    height: "100%",
    minHeight: "400px",
  },

  viewerWrapper: {
    width: "100%",
    height: "clamp(400px, 80vh, 900px)",
    border: "1px solid rgba(0,0,0,0.2)",
    borderRadius: "8px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },

  viewerInner: {
    flex: 1,
    overflow: "hidden",
  },
};