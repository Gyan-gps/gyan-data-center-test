import React from "react";
import styled from "styled-components";
import { Table } from "antd";
import SubHeading from "./SubHeading";

export const TableContainer = styled.div`
  color: #22487e;
  font-family: "Avenir Medium";
  border: 1px solid lightgrey;
  height: 95%;
  width: 100%;
  overflow: auto;
`;

export const Container = styled.div`
  width: 95%;
  height: 95%;
`;

interface TablesProps {
  tableData?: any;
  parentTitle?: string;
  labels?: string[];
  heading?: string;
  subheading?: string;
  headingColor?: string;
  from?: string;
  width?: string;
  height?: string;
}

export default class Tables extends React.Component<TablesProps> {
  constructor(props :TablesProps) {
    super(props);
    this.state = {
      columns: [
        {
          title: "Name",
          dataIndex: "name",
          key: "name",
        },
        {
          title: "Age",
          dataIndex: "age",
          key: "age",
        },
        {
          title: "Address",
          dataIndex: "address",
          key: "address",
        },
        {
          title: "label",
          dataIndex: "label",
          key: "label",
        },
      ],
      dataSource: [
        {
          key: "1",
          name: "Mike",
          age: 32,
          address: "10 Downing Street",
        },
        {
          key: "2",
          name: "John",
          age: 42,
          address: "10 Downing Street",
        },
      ],
    };
  }

  componentDidMount() {
    if (this.props?.tableData) {
      const formattedData = this.tableDataFormater(
        this.props.tableData,
        this.props.parentTitle,
        this.formatNumbers
      );
      this.setState({
        columns: formattedData.formattedColumns,
        dataSource: formattedData.formattedDataSource,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (JSON.stringify(prevProps) !== JSON.stringify(this.props)) {
      if (this.props?.tableData) {
        const formattedData = this.tableDataFormater(
          this.props.tableData,
          this.props.parentTitle,
          this.formatNumbers
        );
        this.setState({
          columns: formattedData.formattedColumns,
          dataSource: formattedData.formattedDataSource,
        });
      }
    }
  }

  formatToUnits = (number, precision) => {
    const abbr = ["", "K", "M", "B", "T"];
    const unrangifiedOrder = Math.floor(Math.log10(Math.abs(number)) / 3);
    const order = Math.max(0, Math.min(unrangifiedOrder, abbr.length - 1));
    const suffix = abbr[order];
    return (number / Math.pow(10, order * 3)).toFixed(precision) + suffix;
  };

   formatToDecimals = (number, precision)=>{
      return Number(number)?.toFixed(precision);
   }

   formatNumbers = (number, precision)=>{
    let x =  Number(number)?.toFixed(precision);
        x = String(x);
    const arr = x.split('.');
     let y = arr[0];
     const z = arr[1];
    const pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(y))
        y = y.replace(pattern, "$1,$2");
        if(z){
          return  String(y + "." + z);
        }else{
          return  String(y);
        } 
  }

  tableDataFormater = (data, parentTitle, fn) => {
    let formattedColumns = [];
    let formattedDataSource = [];
    console.log(data);
    switch (data.graphType) {
      case "bar":
      case "column":
      case "line": {
        for (const [index, value] of Object.keys(data.data[0]).entries()) {
          if (value === "value") {
            formattedColumns.push({
              title: `${data.dataType} (${data.unit})`?.toUpperCase(),
              dataIndex: value.toLowerCase(),
              key: value.toLowerCase(),
            });
          } else if (value === "label") {
            formattedColumns.push({
              title: "YEAR",
              dataIndex: value.toLowerCase(),
              key: value.toLowerCase(),
            });
          } else {
            formattedColumns.push({
              title: value.toUpperCase(),
              dataIndex: value.toLowerCase(),
              key: value.toLowerCase(),
            });
          }
        }

        for (const [index, value] of data.data.entries()) {
          const obj = {
            key: `${index}`,
          };
          for (const elem of formattedColumns) {
            const newKey = elem.key;
            obj[newKey] = obj[newKey] =
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

      case "doughnut":
      case "pie": {
        const sum = data?.data.reduce((acc, cv) => {
          return acc + cv["value"];
        }, 0);

        for (const [index, value] of Object.keys(data.data[0]).entries()) {
          let newTitle = "";
          if (value === "label" && Number(data.data[0][value]) === NaN) {
            newTitle = "YEAR";
            formattedColumns.push({
              title: newTitle,
              dataIndex: value.toLowerCase(),
              key: value.toLowerCase(),
            });
          } else if (value === "label" && Number(data.data[0][value]) !== NaN) {
            if (!this.props?.labels) {
              formattedColumns.push({
                title: value.toUpperCase(),
                dataIndex: value.toLowerCase(),
                key: value.toLowerCase(),
              });
            } else {
              newTitle = this.props?.labels?.length
                ? this.props.labels[0]?.toUpperCase()
                : "COMPANIES";
              formattedColumns.push({
                title: newTitle,
                dataIndex: value.toLowerCase(),
                key: value.toLowerCase(),
              });
            }
          } else if (value === "value" && Number(data.data[0][value]) !== NaN) {
            if (!this.props?.labels) {
              formattedColumns.push({
                title: `${data.dataType} (${data.unit})`?.toUpperCase(),
                dataIndex: value.toLowerCase(),
                key: value.toLowerCase(),
              });
            } else {
              newTitle = data?.units
                ? (this.props?.labels?.length
                    ? this.props.labels[1]?.toUpperCase()
                    : "REVENUE") + ` (${data.units})`
                : this.props?.labels?.length
                ? this.props.labels[1]?.toUpperCase()
                : "REVENUE";
              formattedColumns.push({
                title: newTitle,
                dataIndex: value.toLowerCase(),
                key: value.toLowerCase(),
              });
            }
          } else {
            newTitle = value.toUpperCase();
          }
        }

        for (const [index, value] of data.data.entries()) {
          const obj = {
            key: `${index}`,
          };
          for (const elem of formattedColumns) {
            const newKey = elem.key;

            if (this.props.from === "report-dashboard") {
              obj[newKey] =
                typeof value[newKey] === "number" && !isNaN(value[newKey])
                  ? value[newKey] % 1 === 0
                    ? fn(value[newKey] * (100 / sum), 0) + " %"
                    : fn(value[newKey] * (100 / sum), 2) + " %"
                  : value[newKey];
            } else {
              obj[newKey] =
                typeof value[newKey] === "number" && !isNaN(value[newKey])
                  ? value[newKey] % 1 === 0
                    ? fn(value[newKey], 0)
                    : fn(value[newKey], 2)
                  : value[newKey];
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
            dataIndex: value.toLowerCase(),
            key: value.toLowerCase(),
          });
        }

        for (const [index, value] of data.data.data.entries()) {
          const serName = value.seriesname
            .replaceAll("-", "")
            .replaceAll("<br/>", "");
          formattedColumns.push({
            title: serName.toUpperCase(),
            dataIndex: serName.toLowerCase(),
            key: serName.toLowerCase(),
          });
        }

        for (const [index, value] of data.data.catagory.entries()) {
          const genKey = Object.keys(value)[0];
          const obj = {
            key: `${index}`,
            [genKey]: value[genKey],
          };
          formattedDataSource.push(obj);
        }

        for (const [i, v] of formattedDataSource.entries()) {
          const obj = v;

          for (const [ind, val] of data.data.data.entries()) {
            const serName = val.seriesname
              .replaceAll("-", "")
              .replaceAll("<br/>", "");
            obj[serName?.toLowerCase()] =
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
        if (data.legends.includes("YOY%")) {
          console.log("yo");
          for (const [index, value] of Object.keys(data.data[0]).entries()) {
            if (value === "value") {
              formattedColumns.push({
                title: `${data.dataType} (${data.unit})`?.toUpperCase(),
                dataIndex: value.toLowerCase(),
                key: value.toLowerCase(),
              });
            } else if (value === "label") {
              formattedColumns.push({
                title: "YEAR",
                dataIndex: value.toLowerCase(),
                key: value.toLowerCase(),
              });
            } else {
              formattedColumns.push({
                title: value.toUpperCase(),
                dataIndex: value.toLowerCase(),
                key: value.toLowerCase(),
              });
            }
          }

          for (const [index, value] of data.data.entries()) {
            const obj = {
              key: `${index}`,
            };
            for (const elem of formattedColumns) {
              const newKey = elem.key;
              obj[newKey] = obj[newKey] =
                typeof value[newKey] === "number" && !isNaN(value[newKey])
                  ? value[newKey] % 1 === 0
                    ? fn(value[newKey], 0)
                    : fn(value[newKey], 2)
                  : value[newKey];
            }
            formattedDataSource.push(obj);
          }
        } else {
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
              dataIndex: value.toLowerCase(),
              key: value.toLowerCase(),
            });
          }

          if (this.props.parentTitle === "market snapshot") {
            formattedColumns = formattedColumns.reverse();
          }

          for (const [index, value] of data.data.entries()) {
            const obj = {
              key: `${index}`,
            };
            for (const [i, v] of Object.keys(data.data[0]).entries()) {
              obj[v.toLocaleLowerCase()] =
                typeof value[v] === "number" && !isNaN(value[v])
                  ? value[v] % 1 === 0
                    ? fn(value[v], 0)
                    : fn(value[v], 2)
                  : value[v];
            }

            formattedDataSource.push(obj);
          }
        }
        break;
      }

      case "waterfall2d": {
        const title1 = data.data.data0[0].label.split(" ");
        const title2 = data.data.data1[0].label.split(" ");
        formattedColumns.push(
          {
            title: "CROSS SEGMENTS",
            dataIndex: "label",
            key: "label",
          },
          {
            title: `${title1[title1.length - 1]} (%)`,
            dataIndex: title1[title1.length - 1],
            key: title1[title1.length - 1],
          },
          {
            title: `${title2[title2.length - 1]} (%)`,
            dataIndex: title2[title2.length - 1],
            key: title2[title2.length - 1],
          }
        );

        for (const [i, v] of data.data.data0.entries()) {
          formattedDataSource.push({
            key: `${i}`,
            label: data.meta.legends_list[i],
            [title1[title1.length - 1]]:
              typeof data.data.data0[i].value === "number" &&
              !isNaN(data.data.data0[i].value)
                ? data.data.data0[i].value % 1 === 0
                  ? fn(data.data.data0[i].value, 0)
                  : fn(data.data.data0[i].value, 2)
                : data.data.data0[i].value,
            [title2[title2.length - 1]]:
              typeof data.data.data1[i].value === "number" &&
              !isNaN(data.data.data1[i].value)
                ? data.data.data1[i].value % 1 === 0
                  ? fn(data.data.data1[i].value, 0)
                  : fn(data.data.data1[i].value, 2)
                : data.data.data1[i].value,
          });
        }
        break;
      }

      case "msline":
      case "groupedColumn": {
        for (const item of data?.data?.categories) {
          const Year = Number(item.category[0].label.split("(")[0].trim());

          const isYear = Year != NaN && Year >= 2000 && Year <= 2050;

          formattedColumns.push({
            title: isYear ? "Year" : "Label",
            dataIndex: "label",
            key: "label",
          });
        }

        for (const item of data?.data?.dataset) {
          formattedColumns.push({
            title: item.seriesname,
            dataIndex: item.seriesname.toLowerCase(),
            key: item.seriesname.toLowerCase(),
          });
        }

        for (let i = 0; i < data?.data?.categories[0].category?.length; i++) {
          formattedDataSource.push({
            key: String(i),
            label: data?.data?.categories[0].category[i].label,
          });
        }

        for (const item of data?.data?.dataset) {
          for (let i = 0; i < item?.data?.length; i++) {
            const key = item?.seriesname.toLowerCase();
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

    return {
      formattedColumns,
      formattedDataSource:
        !Object.prototype.hasOwnProperty.call(this.props.tableData, "dataHidden") &&
        this.props.tableData.dataHidden === true
          ? null
          : formattedDataSource,
    };
  };

  render() {
     const {tableData, from} = this.props;

     const isHeaderHidden =  (from === "report-dashboard" && tableData?.graphType !== 'groupedColumn' ) ? true : false
    
    const locale = {
      emptyText: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#002F75",
            fontSize: "16px",
            padding: "10px",
          }}
        >
          DATA HIDDEN FROM VIEW
        </div>
      ),
    };

    return (
      <Container
        style={{ width: "100%" }}
        width={this.props.width}
        height={this.props.height}
      >
        <SubHeading
          heading={this.props.heading}
          subheading={this.props.subheading}
          backgroundColor={this.props.headingColor}
        />
        <TableContainer>
          <Table
           className={isHeaderHidden ? "segmentation-table reports-table"  : "segmentation-table"}
            locale={locale}
            bordered={false}
            pagination={false}
            columns={this.state.columns}
            dataSource={this.state.dataSource}
          />
        </TableContainer>
      </Container>
    );
  }
}
