import React, { useRef, useState } from "react";
import {
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
} from "@mui/material";
import { FaFileExcel } from "react-icons/fa6";
type ExcelFile = {
  file_name: string;
  fileName: string;
  title: string;
  url: string;
};

type Props = {
  reportExcel: ExcelFile[];
};

const DatasheetDetailsTab: React.FC<Props> = ({
  reportExcel,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);


  const [selectedFile, setSelectedFile] = useState<ExcelFile>(
    reportExcel[reportExcel.length - 1]
  );


  const handleFileChange = (event: any) => {
    const file = reportExcel.find(
      (f) => f.file_name === event.target.value
    );
    if (file) setSelectedFile(file);
  };

  const downloadGoogleSheet = () => {
    if  ( !selectedFile) return;

    const a = document.createElement("a");
    a.href = selectedFile.url;
    a.target = "_blank";
    a.download = `${selectedFile.title}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const excelUI = encodeURIComponent(selectedFile?.url);
  const iframeUrl = `https://view.officeapps.live.com/op/view.aspx?src=${excelUI}&wdOrigin=BROWSELINK`;

  if (!selectedFile) {
    return (
      <Box sx={styles.container}>
        <Box sx={styles.noDataBox}>
          <Typography>No datasheet available for this report.</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>


      {/* Main Content */}
      <Box
        sx={{
          ...styles.excelContainer,
        }}
      >
        {/* Header */}

        <Box sx={styles.container}>
          <Box sx={styles.excelContainer}>

            {/* ✅ Header */}
            <Box sx={styles.header}>

              {/* Left: Title */}
              <Typography sx={styles.title}>
                {selectedFile.title}
              </Typography>

              {/* Right: Controls */}
              <Box sx={styles.actions}>
                {reportExcel.length > 1 && (
                  <FormControl size="small" sx={styles.dropdown}>
                    <InputLabel>Select File</InputLabel>
                    <Select
                      value={selectedFile.file_name}
                      onChange={handleFileChange}
                      label="Select File"
                    >
                      {reportExcel.map((file) => (
                        <MenuItem key={file.file_name} value={file.file_name}>
                          {file.fileName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <Button
                  variant="contained"
                  startIcon={<FaFileExcel />}
                  onClick={downloadGoogleSheet}
                  sx={styles.downloadBtn}
                >
                  Download
                </Button>
              </Box>
            </Box>

            {/* Iframe */}
            <Box sx={styles.iframeWrapper}>
              <Box sx={styles.overlay} />
              <iframe
                ref={iframeRef}
                src={iframeUrl}
                title="Excel Viewer"
                style={styles.iframe}
              />
            </Box>

          </Box>
        </Box>

      </Box>
    </Box>
  );
};

export default DatasheetDetailsTab;

const styles = {
  container: {
    width: "100%",
    px: "clamp(10px,2vw,20px)",
    py: "clamp(10px,2vw,20px)",
  },

  excelContainer: {
    width: "100%",
    borderRadius: "14px",
    overflow: "hidden",
    background: "#fff",
    boxShadow: "0 6px 24px rgba(0,0,0,0.06)", // 🔥 depth
    border: "1px solid #f0f0f0",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    padding: "16px 18px",
    borderBottom: "1px solid #f0f0f0",
    flexWrap: "wrap",
  },

  title: {
    fontWeight: 600,
    fontSize: "30px",
    color: "#1f2937",
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  downloadBtn: {
    borderRadius: "8px",
    textTransform: "none",
    fontWeight: 500,
    backgroundColor: "#1d4ed8",
    "&:hover": {
      backgroundColor: "#1e40af",
    },
  },

  dropdown: {
    minWidth: "160px",
    background: "#fff",
  },

  iframeWrapper: {
    position: "relative",
    width: "100%",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "155px",
    background: "#f9f9f9",
    zIndex: 2,
  },

  iframe: {
    width: "100%",
    height: "clamp(450px, 80vh, 900px)",
    border: "none",
  },
    noDataBox: {
    minHeight: "400px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};