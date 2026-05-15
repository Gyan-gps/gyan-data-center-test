import React, { useEffect, useRef, useState } from "react";
import { Container, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "@/hooks";
import { setCookie, getDomainInfo } from "../../../../utils/myra";

//  TYPES
type FromType = "global" | "hub" | "hub_report" | "flash" | "library";

interface AnswerEngineProps {
  hubId?: string | null;
  libraryReportId?: string | null;
  libraryReportPurchased?: boolean | null;
  subscribed?: boolean;
  fetchReport?: () => void;
  title?: string;
  id?: string | number;
  from?: FromType;
  uploadId?: string | null;
  created_from?: string;
}


const AnswerEngine: React.FC<AnswerEngineProps> = ({
  hubId,
  libraryReportId = null,
  from = "library",
  uploadId,
}) => {
  const { user} = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const iframeContainerRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    if (!user) return;

    setLoading(true);

    const authenticate = async () => {
      try {
        switch (from) {
          case "flash":
          case "library":
            setCookie("uploadId", uploadId || '');
            break;

          default:
            console.error("Invalid 'from' prop");
            break;
        }

        setLoading(false);
      } catch (error) {
        console.error("Error during authentication:", error);
        setLoading(false);
      }
    };

    authenticate();
  }, [libraryReportId, user, from, hubId, uploadId]);

  const hostname = window.location.hostname;
  const { iframeDomain } = getDomainInfo(hostname);
  const iFrameSrc: string = iframeDomain;

  const handleIframeLoad = () => {
    iframeContainerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ position: "relative" }}>

      <Container
        ref={iframeContainerRef}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          width: "90%",
          filter: "none",
          pointerEvents: "unset",
        }}
      >
        {loading ? (
          <>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Authenticating...
            </Typography>
          </>
        ) : (
          <div
            style={{
              height: "100vh",
              width: "100vw",
              margin: 0,
              padding: 0,
            }}
          >
            <iframe
              title="Answer Engine"
              style={{
                height: "100%",
                width: "100%",
                border: "none",
              }}
              src={iFrameSrc}
              onLoad={handleIframeLoad}
            />
          </div>
        )}
      </Container>
    </div>
  );
};

export default AnswerEngine;