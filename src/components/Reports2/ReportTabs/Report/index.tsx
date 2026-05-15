import React, { useState } from "react";
import {
  Box,
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { saveAs } from "file-saver";
import { DownloadingOutlined } from "@mui/icons-material";
import { toast } from "react-toastify";
import PdfViewer from "./PdfViewer";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();
type FileType = {
  file_name: string;
  fileName: string;
  url: string;
};

type Props = {
  reportPdf: FileType[];
selectedSlide?: number | null;};

const ReportDetailsTab: React.FC<Props> = ({
  reportPdf,
  selectedSlide
}) => {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileType>(
    reportPdf[reportPdf.length - 1]
  );




  const handleFileChange = (event: any) => {
    const file = reportPdf.find(
      (f) => f.file_name === event.target.value
    );
    if (file) setSelectedFile(file);
  };

  async function forceDownload(
    { report_url }: { report_url: string },
    pdf_name: string
  ) {
    setPdfLoading(true);

    const downloadPromise = new Promise(function (resolve, reject) {
      const x = new XMLHttpRequest();
      x.open("GET", report_url, true);
      x.responseType = "blob";

      x.onload = function () {
        resolve(x.response);
      };

      x.onerror = function () {
        reject(new Error("Download failed"));
      };

      x.send();
    })
      .then(async (pdf_blob: any) => {
        saveAs(pdf_blob, pdf_name, "application/pdf");
        setPdfLoading(false);
      })
      .catch(() => setPdfLoading(false));

    toast.promise(downloadPromise, {
      pending: "Downloading...",
      success: "Download completed",
      error: "Download failed",
    });
  }

  return (
    <Container maxWidth="xl" sx={styles.container}>

      {/* Top Bar */}
      {reportPdf?.length > 0 && selectedFile?.url && (
        <Box sx={styles.topBar}>
          {/* LEFT */}
          <Box sx={styles.leftSection}>
              <Tooltip title="Download PDF">
                <IconButton
                  onClick={() => {
                    forceDownload(
                      { report_url: selectedFile.url },
                      selectedFile.file_name
                    );
                  }}
                  sx={styles.downloadBtn}
                >
                  <DownloadingOutlined />
                </IconButton>
              </Tooltip>

          </Box>

          {/* RIGHT */}
          {reportPdf.length > 1 && (
            <Box sx={styles.dropdown}>
              <InputLabel sx={{ fontSize: "12px" }}>Select File</InputLabel>

              <FormControl sx={styles.formControl}>
                <Select
                  value={selectedFile.file_name}
                  onChange={handleFileChange}
                  size="small"
                >
                  {reportPdf.map((file) => (
                    <MenuItem key={file.file_name} value={file.file_name}>
                      {file.fileName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>
      )}

      {/* PDF VIEW */}
      <Box sx={styles.pdfContainer}>
        {selectedFile?.url ? (
            <PdfViewer key={`${selectedFile.url}-${selectedSlide}`} fileUrl={selectedFile.url} allowDownload={false} selectedSlide={selectedSlide} />
        ) : (
          <Box sx={styles.centerBox}>
            <Typography variant="h6" color="textSecondary">
              No PDF available for this report.
            </Typography>
          </Box>
        )}
      </Box>

    </Container>
  );
};

export default ReportDetailsTab;
const styles = {
  container: {
    my: "clamp(1rem,2vw,3rem)",
    px: "clamp(8px,2vw,16px)",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
    mb: "12px",
  },

  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },

  downloadBtn: {
    border: "1px solid #002F75",
    borderRadius: "8px",
    p: "10px",
    color: "#189cde",
    "&:hover": {
      backgroundColor: "#446ba6",
      color: "#fff",
    },
  },

  dropdown: {
    display: "flex",
    flexDirection: "column",
    minWidth: "140px",
  },

  formControl: {
    border: "1px solid #002F75",
    borderRadius: "8px",
  },

  pdfContainer: {
    height: {
      xs: "400px",
      sm: "500px",
      md: "700px",
    },
    backgroundColor: "#F4F8FA",
    overflow: "hidden",
    borderRadius: "8px",
  },

  centerBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    textAlign: "center",
  },
};