import React,{useState} from 'react';
import exportFromJSON from "export-from-json";
import { Box , Button, Tooltip, Popover} from "@mui/material";
import { Switch } from "antd";
import FusionCharts from "fusion_modules/fusioncharts-suite-xt-master/addlicense";
import downloadIcon from "../../../../../assets/download_icon.svg";
import Table from "./Table";
import ArchiveGraphs from './ArchiveGraphs';
import { colors } from '../../../../../utils/colors';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';

type ViewProps = {
  data?: any;
  index: number;
  alternateHeading?: string;
  graphHeader?: string;
  graphType: string;
  graphData: any;
  slide?: number;
  reportId?: string;
  graphTableId?: string;
  positionIndex?: number;
  tag?: string;
  legends?: any[];
  dataHidden?: boolean;
  blurred?: boolean;
  isLibraryReport?: boolean;
  gotToGraphInReport?: () => void;
};
const View: React.FC<ViewProps> = ({
  index,
  graphHeader,
  graphType,
  graphData,
  legends,
  dataHidden,
  isLibraryReport,
  gotToGraphInReport,
}) => {
  const [currentView, setCurrentView] = useState("graph");
  const [displayData, setDisplayData] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [graphId, setGraphId] = useState(Math.ceil(Math.random()*1000) + "-" + graphHeader?.trim()?.toLowerCase());

  const switchStyles = {
    marginLeft: "12px",
    color: "red",
    backgroundColor: "#446BA6",
    padding: "1px",
    height: "22px",
  };

  const downloadButtonStyles = {
    border: "1px solid #446BA6",
    borderRadius: "14px",
    marginLeft: "12px",
    height: "22px",
    width: "60px",
  };


  const COLORS = [...colors];
        COLORS.length = 10;


  const handleViewChange = (checked: any) => {
    setCurrentView(checked ? "table" : "graph");
  };

  const handleDownloadModalOpen = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDownloadModalClose = (event: any) => {
    setAnchorEl(null);
  };

  const formatExportData = (data, labels, fn, fileName) => {
    let formattedColumns = [];
    let formattedDataSource = [];
    switch (data.graphType) {
      case "bar":
      case "column":
      case "line": {
        for (const [index, value] of Object.keys(data.data[0]).entries()) {
          if (value === "value") {
            formattedColumns.push({
              title: "VALUE",
              key: value,
            });
          } else if (value === "label") {
            formattedColumns.push({
              title: "YEAR",
              key: value,
            });
          } else {
            formattedColumns.push({
              title: value.toUpperCase(),
              key: value,
            });
          }
        }

        for (const [index, value] of data.data.entries()) {
          const obj = {};

          for (const elem of formattedColumns) {
            const newKey = elem.title;
            obj[newKey] = value[elem.key];
          }
          formattedDataSource.push(obj);
        }

        break;
      }

      case "doughnut":
      case "pie": {

        const sum = data?.data.reduce((acc, cv)=>{
          return  acc + cv['value']
       }, 0)


        if (labels.length === 0) {
          for (const [index, value] of Object.keys(data.data[0]).entries()) {
            let newTitle = "";

            if (value === "label" && Number(data.data[0][value]) === NaN) {
              newTitle = "YEAR";
              formattedColumns.push({
                title: newTitle,
              });
            } else if (
              value === "label" &&
              Number(data.data[0][value]) !== NaN
            ) {
              newTitle = "COMPANIES";
              formattedColumns.push({
                title: newTitle,
              });
            } else if (
              value === "value" &&
              Number(data.data[0][value]) !== NaN
            ) {
              newTitle = data?.units
                ? "REVENUE " + `(${data.units})`
                : "REVENUE";
              formattedColumns.push({
                title: newTitle,
              });
            } else {
              newTitle = value.toUpperCase();
            }
          }
        } else {
          labels.map((label) => {
            let newTitle = "";
            if (label.toLowerCase() != "company") {
              newTitle = label + `(${data.units})`;
            } else {
              newTitle = label;
            }

            newTitle = newTitle.toUpperCase();
            formattedColumns.push({
              title: newTitle,
            });
          });
        }
        for (const [index, value] of data.data.entries()) {
          const obj = {};
          for (const elem of formattedColumns) {
            if (elem.title.includes("COMPAN")) {
              const key = elem.title;
              obj[key] = value["label"];
            } else {
              const key = elem.title;
              obj[key] =
                typeof value["value"] === "number" && !isNaN(value["value"])
                  ? value["value"] % 1 === 0
                    ? fn(value["value"]*(100/sum), 0) + " %"
                    : fn(value["value"]*(100/sum), 2) + " %"
                  : value["value"];
            }
          }

          formattedDataSource.push(obj);
        }

        break;
      }

      case "boxes": {
        for (const [index, value] of Object.keys(data.data[0]).entries()) {
          let newTitle = "";
          if (value === "label" && Number(data.data[0][value]) === NaN) {
            newTitle = "YEAR";
          } else if (value === "label" && Number(data.data[0][value]) !== NaN) {
            newTitle = "COMPANIES";
          } else if (value === "value" && Number(data.data[0][value]) !== NaN) {
            newTitle = "REVENUE";
          } else {
            newTitle = value.toUpperCase();
          }
          formattedColumns.push({
            title: newTitle,
            dataIndex: value.toLowerCase(),
            key: value.toLowerCase(),
          });
        }

        for (const [index, value] of data.data.entries()) {
          const obj = {
            key: `${index}`,
          };
          for (const elem of formattedColumns) {
            const newKey = elem.key;
            obj[newKey] =
              typeof value[newKey] === "number" && !isNaN(value[newKey])
                ? value[newKey] % 1 === 0
                  ? fn(value[newKey], 0)
                  : fn(value[newKey], 2)
                : value[newKey];
          }
          formattedDataSource.push(obj);
        }

        break;
      }

      case "Hstackedbar":
      case "stackedColumn": {
        for (const [index, value] of Object.keys(
          data.data.catagory[0]
        ).entries()) {
          let newTitle = "";
          if (
            value === "label" &&
            Number(data.data.catagory[0][value]) !== NaN
          ) {
            newTitle = "YEAR";
          } else {
            newTitle = value.toUpperCase();
          }
          formattedColumns.push({
            title: newTitle,
          });
        }
        for (const [index, value] of data.data.data.entries()) {
          const serName = value.seriesname
            .replaceAll("-", "")
            .replaceAll("<br/>", "");
          formattedColumns.push({
            title: serName.toUpperCase(),
          });
        }
        for (const [index, value] of data.data.catagory.entries()) {
          const genKey = Object.keys(value)[0];
          const obj = {
            ["YEAR"]: value[genKey],
          };
          formattedDataSource.push(obj);
        }
        for (const [i, v] of formattedDataSource.entries()) {
          const obj = v;
          for (let [ind, val] of data.data.data.entries()) {
            let serName = val.seriesname
              .replaceAll("-", "")
              .replaceAll("<br/>", "");
            obj[serName?.toUpperCase()] =
              typeof val.data[i]?.value === "number" &&
              !isNaN(val.data[i]?.value)
                ? val.data[i]?.value % 1 === 0
                  ? fn(val.data[i]?.value, 0)
                  : fn(val.data[i]?.value, 2)
                : val.data[i]?.value;
          }
        }
        break;
      }

      case "barline": {
        for (const [index, value] of Object.keys(data.data[0]).entries()) {
          let newTitle = "";
          if (value === "label" && Number(data.data[0][value]) !== NaN) {
            newTitle = "YEAR";
          } else if (value === "value") {
            newTitle = "YOY (%)";
          } else if (value === "volume") {
            newTitle = `${data.legends[0]} (${data.units})`.toUpperCase();
          } else {
            newTitle = value.toUpperCase();
          }
          formattedColumns.push({
            title: newTitle,
          });
        }

        for (const [index, value] of data.data.entries()) {
          const obj = {};
          for (const [i, v] of Object.keys(data.data[0]).entries()) {
            obj[formattedColumns[i].title] =
              typeof value[v] === "number" && !isNaN(value[v])
                ? value[v] % 1 === 0
                  ? fn(value[v], 0)
                  : fn(value[v], 2)
                : value[v];
          }

          formattedDataSource.push(obj);
        }
        break;
      }

      case "msline":
      case "groupedColumn": {
        let titleValue = ''
        for (const item of data?.data?.categories) {
          const  Year = Number(item.category[0].label.split("(")[0].trim());
          const  isYear =  Year != NaN && Year >= 2000 && Year <=2050
          
          titleValue = isYear === true ? "YEAR" : "LABEL";
          formattedColumns.push({
            title: titleValue
          });
        }

        for (const item of data?.data?.dataset) {
          formattedColumns.push({
            title: item.seriesname.toUpperCase(),
          });
        }

        for (let i = 0; i < data?.data?.categories[0].category?.length; i++) {
          formattedDataSource.push({
            [titleValue]: data?.data?.categories[0].category[i].label,
          });
        }

        for (const item of data?.data?.dataset) {
          for (let i = 0; i < item?.data?.length; i++) {
            const key = item?.seriesname.toUpperCase();
            formattedDataSource[i][key] = item?.data[i].value;
          }
        }
        break;
      }

      case "":
      case "none":
      case null:
      case undefined: {
        formattedColumns = null;
        formattedDataSource = null;
        break;
      }
      default: {
        formattedColumns = null;
        formattedDataSource = null;
      }
    }

    for (let i = 0; i <= 2; i++) {
      const sourceObj = {};
      formattedColumns?.map((column, index) => {
        const key = column?.title;
        let val = "";
        if (i === 1) {
          val = index === 0 ? `${fileName}` : "";
        } else if (i === 2) {
          val = index === 0 ? "Source: Mordor Intelligence" : "";
        } else {
          val = "";
        }
        sourceObj[`${key}`] = val;
      });
      formattedDataSource.push(sourceObj);
    }

   const  keys = Object.keys(formattedDataSource[0])

   const newObj ={};
     for(let i = 0; i < keys.length ; i++){
        let k = keys[i]
         newObj[k] = " ".repeat(i+1);
       }

   const newFormattedDataSource = formattedDataSource.map((item)=>{
       const newItem = {};
       for(let key in item){
        const newKey = newObj[key];
        newItem[newKey]  = item[key]
       }
       return  newItem;
    })

  if( data.graphType ===  "groupedColumn"){
     return formattedDataSource;
  }else{
    return newFormattedDataSource;
  }
  };

  const formatNumbers = (number, precision) => {
    let x = Number(number)?.toFixed(precision);
    x = String(x);
    const arr = x.split(".");
    let y = arr[0];
    const z = arr[1];
    const pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(y)) y = y.replace(pattern, "$1,$2");
    if (z) {
      return String(y + "." + z);
    } else {
      return String(y);
    }
  };

  const export_chart = async (format, id) => {

    format = format.trim().toLowerCase();

    const selectedChart = FusionCharts(String(id));
    if (selectedChart) {
      selectedChart?.exportChart({
        exportFormat: format,
      });
    }
  };

  const exportAsTable = async (exportData: { graphType: string; data: any; heading: string }, labels: any[], type: string) => {
    const fileName = exportData.heading;
    const exportType = exportFromJSON.types[type];
    const data = formatExportData(exportData, labels, formatNumbers, fileName);

    exportFromJSON({ data, fileName, exportType });

  };

  const Open = Boolean(anchorEl);
  const id = Open ? "popover" : undefined;

  const labels = displayData.hasOwnProperty("labels")
    ? displayData?.labels
    : [];

  let totalPlots = 0;
  let hideValueAndShowAxis = false;
  if (graphType === "groupedColumn") {
    totalPlots =
      graphData?.dataset?.length * graphData?.categories[0]?.category?.length;
    hideValueAndShowAxis = totalPlots <= 14 ? false : true;
  } else if (graphType === "column") {
    totalPlots = graphData?.length;
    hideValueAndShowAxis = totalPlots <= 8 ? false : true;
  } else if (graphType === "msline") {
    totalPlots = graphData?.categories[0]?.category?.length;
    hideValueAndShowAxis = totalPlots <= 14 ? false : true;
  }

  return (
    <Box
      sx={{
        gridColumn: "span 1",
        position: "relative",
      }}
    >
  
      <Box
        sx={{
          boxSizing: "border-box",
          boxShadow: "0px 2px 20px 0px rgba(0, 47, 117, 0.1)",
          borderRadius: "8px",
          marginBottom: "2rem",
          overflow: "hidden",
          // ...(blurred && {
          //   filter: "blur(5px)",
          //   pointerEvents: "none",
          // }),
          "&:hover": {
            cursor: "pointer",
            boxShadow: "0px 2px 20px 0px rgba(0, 47, 117, 0.25)",
          },
        }}
      >
        <Box
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "10px",
          }}
        >
          <Switch
            onChange={handleViewChange}
            checkedChildren="TABLE"
            unCheckedChildren="GRAPH"
            style={switchStyles}
          />

           
            <>
            <Tooltip title={"View Export Options"} placement="top">
              <Button
                style={downloadButtonStyles}
                onClick={handleDownloadModalOpen}
              >
                <img src={downloadIcon} alt="Download" />
              </Button>
            </Tooltip>
            <Tooltip title={"Go to graph in report"} placement="top">
              <Button
                style={{...downloadButtonStyles, width:'fit-content'}}
                onClick={gotToGraphInReport}
              >
                <SummarizeOutlinedIcon fontSize='small' sx={{ color: "rgb(68, 107, 166)"}} />
              </Button>
            </Tooltip>
            </>
        

          <Popover
            id={id}
            open={Open}
            anchorEl={anchorEl}
            onClose={handleDownloadModalClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
          >
            {currentView === "graph" && (
              <>
                <p>
                  <Button
                    sx={{ width: "100%" }}
                    onClick={() => {
                      export_chart("jpg", graphId);
                    }}
                  >
                    Export As JPG
                  </Button>
                </p>
                <p>
                  <Button
                    sx={{ width: "100%" }}
                    onClick={() => {
                      export_chart("png", graphId);
                    }}
                  >
                    Export As PNG
                  </Button>
                </p>
                <p>
                  <Button
                    sx={{ width: "100%" }}
                    onClick={() => {
                      export_chart("svg", graphId);
                    }}
                  >
                    Export As SVG
                  </Button>
                </p>
                <p>
                  <Button
                    sx={{ width: "100%" }}
                    onClick={() => {
                      export_chart("pdf", graphId);
                    }}
                  >
                    Export As PDF
                  </Button>
                </p>
              </>
            )}
            {currentView === "table" && (
              <>
                <p>
                  <Button
                    sx={{ width: "100%" }}
                    onClick={() =>{
                      exportAsTable(
                        {
                          graphType: graphType,
                          data: graphData,
                          heading: graphHeader,
                        },
                        labels,
                        "csv"
                      );
                      
                    }}
                  >
                    Export As CSV
                  </Button>
                </p>
                <p>
                  <Button
                    sx={{ width: "100%" }}
                    onClick={() =>{
                      exportAsTable(
                        {
                          graphType: graphType,
                          data: graphData,
                          heading: graphHeader,
                        },
                        labels,
                        "xls"
                      );
                    }}
                  >
                    Export As XLS
                  </Button>
                </p>
              </>
            )}
          </Popover>
        </Box>

        {currentView === "graph" ? (
          <Box sx={{ width: "100%", height: { xs: "300px", sm: "350px", md: "425px" } }}>
          <ArchiveGraphs
            id={graphId}
            meta={displayData?.data?.meta}
            data={graphData}
            height="100%"
            width={"100%"}
            header={graphHeader}
            footer={""}
            yAxisName={""}
            xAxisName={""}
            dynamiclegends={legends ? legends : []}
            graphType={graphType}
            dataHidden={dataHidden && dataHidden === true ? true : false}
            allow_cagr={
              Object.prototype.hasOwnProperty.call(displayData?.data || {}, "cagr_value") ? true : false
            }
            cagr_year={displayData?.data?.cagr_year}
            cagr_value={displayData?.data?.cagr_value}
            showValues={true}
            valueFontSize={12}
            valueFontBold={true}
            templateName={"Any"}
            slideName={"Any"}
            // color={COLORS[index]}
            headingColor={COLORS[index % 10]}
            hideValueAndShowAxis={hideValueAndShowAxis || false }
            isLibraryReport={isLibraryReport}
          />
          </Box>
        ) : (
          <Box
            sx={{
              height: { xs: "280px", sm: "320px", md: "400px" },
              paddingBottom: "0",
            }}
          >
            <Table
              tableData={{
                data: graphData,
                dataType: "",
                graphType: graphType,
                heading: graphHeader,
                units: "",
                url: "",
                legends: legends || [],
              }}
              labels={labels}
              parentTitle={graphHeader}
              heading={graphHeader}
              color={COLORS[index]}
              headingColor={COLORS[index % 10]}
              from={"report-dashboard"}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default View;