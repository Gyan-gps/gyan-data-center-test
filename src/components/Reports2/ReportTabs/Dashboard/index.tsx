import React, { useEffect, useState } from "react";
import View from "./View"
import { Box, Button } from "@mui/material";
import _, { isArray } from "lodash";

export const correctGraphNames = {
  bar: "column",
  pie: "pie",
  line: "msline",
  stackedBar: "groupedColumn",
  barline: "barline",
  dualAxis: "msline",
};

type Props = {
  data: any;
  orderOfTags: string[];
  setSelectedSlide: (slide: number) => void;
setCurrentTab: (tab: string) => void;
};

const AllGraphsDashboard: React.FC<Props> = ({
  data,
  orderOfTags,
  setCurrentTab: setCurrentTabFromParent,
  setSelectedSlide
}) => {

  const [dashboardData, setDashboardData] = useState<any>([]);
  const [tabs, setTabs] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState<string>("");

  useEffect(() => {
    if (!data) return;
    setDashboardData(data);
    setTabs(orderOfTags);
    setCurrentTab(orderOfTags[0]);
  }, [data]);



  const validateData = (type: any, data: any) => {
    if (isArray(data) && data.length === 0) return false;

    if (type === "pie" || type === "bar" || type === "column" || type === "line") {
      return data.every((item: any) => {
        if (!Object.prototype.hasOwnProperty.call(item, "value") || !Object.prototype.hasOwnProperty.call(item, "label")) return false;
        return item.value !== 0;
      });
    }
    return true;
  };


  if (dashboardData?.length === 0) {
    return (
      <Box sx={styles.loaderContainer}>
        <Box sx={styles.loader} />
      </Box>
    );
  }

const gotToGraphInReport = (slideNumber: number) => {
  if (!slideNumber) return;

  setSelectedSlide(slideNumber - 1);

  setCurrentTabFromParent("report");
};

  return (
    <Box sx={styles.container}>
      {/* Tabs */}
      <Box sx={styles.tabs}>
        {tabs?.map((tab) => {
          if (tab === "null") return null;

          return (
            <Button
              key={tab}
              sx={{
                ...styles.tabBtn,
                ...(tab === currentTab && styles.activeTab),
              }}
              onClick={() => setCurrentTab(tab)}
            >
              {tab.trim().toUpperCase()}
            </Button>
          );
        })}
      </Box>

      {/* Grid */}
      <Box sx={styles.grid}>
        {dashboardData[currentTab]?.map((item: any, index: number) =>
          validateData(
            correctGraphNames[item?.data?.graphType as keyof typeof correctGraphNames],
            item?.data?.fusion_chart_data
          ) === false ? null : (
            <Box key={index}>
              <View
                graphHeader={item?.data?.graphTitle}
                graphType={correctGraphNames[item?.data?.graphType as keyof typeof correctGraphNames]}
                graphData={item?.data?.fusion_chart_data}
                slide={item?.slide}
                reportId={item?.reportId}
                graphTableId={item?.graphTableId}
                positionIndex={item?.positionIndex}
                tag={item?.tag}
                index={index}
                isLibraryReport={true}
                gotToGraphInReport={() => gotToGraphInReport(item.slide)}
                legends={item?.data?.legends || []}
              />
            </Box>
          )
        )}
      </Box>
    </Box>
  );
};

export default AllGraphsDashboard;
const styles = {
  container: {
    p: "clamp(8px,2vw,16px)",
  },

  tabs: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    mb: "20px",
  },

  tabBtn: {
    background: "#fff",
    color: "#446BA6",
    fontSize: "clamp(12px,1.5vw,14px)",
  },

  activeTab: {
    background: "#446BA6",
    color: "#fff",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: {
  xs: "1fr",
  sm: "1fr",
  md: "repeat(2, 1fr)",
  lg: "repeat(2, 1fr)",
},px: { xs: 1, sm: 2, md: 0 },
    gap: "16px",
  },

  loaderContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "400px",
  },

  loader: {
    width: "45px",
    height: "45px",
    border: "3px solid #446BA6",
    borderBottomColor: "transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};