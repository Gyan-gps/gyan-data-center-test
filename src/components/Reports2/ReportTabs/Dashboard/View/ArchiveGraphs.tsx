// @ts-nocheck
import React, { Component } from "react";
import Bar from "./Bar";
import Column from "./Column";
import Doughnut from "./Doughnut";
import Line from "./Line";
import Pie from "./Pie";
import BarLine from "./BarLine";
import MultiSeriesline from "./MultiSeriesLine";
import GroupedColumn from "./GroupedColumn";

export const graphsConfig = {
  column: Column,
  bar: Bar,
  doughnut: Doughnut,
  pie: Pie,
  line: Line,
  barline: BarLine,
  msline: MultiSeriesline,
  groupedColumn: GroupedColumn
};

export default class ArchiveGraphs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataHidden: false,
      graphHidden: false,
      graphType: "bar",
      data: [{ label: "Venezuela", value: "290" }],
    };
  }

  componentDidMount() {
    if (this.props?.dataHidden) {
      this.setState({
        dataHidden: this.props.dataHidden,
      });
    }
    if (this.props?.graphType) {
      this.setState({
        graphType: this.props.graphType,
      });
    }

    if (this.props?.data) {
      this.setState({
        graphHidden: this.props.data === "hidden" ? true : false,
        data: this.props.data,
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps) !== JSON.stringify(this.props)) {
      if (this.props?.dataHidden) {
        this.setState({
          dataHidden: this.props.dataHidden,
        });
      }
      if (this.props?.graphType) {
        this.setState({
          graphType: this.props.graphType,
        });
      }
      if (this.props?.data) {
        this.setState({
          graphHidden: this.props.data === "hidden" ? true : false,
          data: this.props.data,
        });
      }
    }
  }

  render() {
    const Graph = graphsConfig[this.state.graphType];
    let width = 1080 * 0.955,
        height = 610 * 0.925;
    if (this.props.width) {
      width =
        Number(String(this.props?.width)?.replaceAll("%", "").trim()) *
        (1080 / 100) *
        0.655;
    }

    if (this.props.height) {
      height =
        Number(String(this.props?.height)?.replaceAll("%", "").trim()) *
        (610 / 100) *
        0.925;
    }

    return (
      <>
        {Graph !== undefined ? (
          <>
            <Graph
              id={this.props.id}
              graphType={this.state.graphType}
              dataHidden={this.state.dataHidden}
              graphHidden={this.state.graphHidden}
              data={this.state.data ? this.state.data : []}
              meta={this.props?.meta}
              header={this.props.header}
              footer={this.props.footer}
              height={this.props.height}
              width={"100%"}
              wrapWidth={600}
              allow_cagr={this.props.allow_cagr}
              cagr_year={this.props.cagr_year}
              cagr_value={this.props.cagr_value}
              yHeadingMargin={
                this.props.yHeadingMargin ? this.props.yHeadingMargin : 15
              }
              xHeadingMargin={
                this.props.xHeadingMargin ? this.props.xHeadingMargin : 0
              }
              wrapHeadingWidth={
                this.props.wrapHeadingWidth ? this.props.wrapHeadingWidth : 0
              }
              chartHeadingGap={
                this.props.chartHeadingGap ? this.props.chartHeadingGap : 5
              }
              chartTopMargin={1}
              chartBottomMargin={
                this.props.chartBottomMargin ? this.props.chartBottomMargin : 0
              }
              chartLeftMargin={
                this.props.chartLeftMargin ? this.props.chartLeftMargin : 2
              }
              chartRightMargin={
                this.props.chartRightMargin ? this.props.chartRightMargin : 0
              }
              legends={true}
              dynamiclegends={
                this.props.dynamiclegends ? this.props.dynamiclegends : ""
              }
              legendsPositionDynamic={
                this.props.legendsPositionDynamic
                  ? this.props.legendsPositionDynamic
                  : false
              }
              legendsXPosition={
                this.props.legendsXPosition ? this.props.legendsXPosition : 0
              }
              legendsYPosition={
                this.props.legendsYPosition ? this.props.legendsYPosition : 0
              }
              xAxisName={this.props.xAxisName ? this.props.xAxisName : ""}
              yAxisName={this.props.yAxisName ? this.props.yAxisName : ""}
              showValues={this.props.showValues ? this.props.showValues : 1}
              valueFontSize={
                this.props.valueFontSize ? this.props.valueFontSize : 12
              }
              valueFontBold={
                this.props.valueFontBold ? this.props.valueFontBold : 0
              }
              rotateValues={
                this.props.rotateValues ? this.props.rotateValues : 0
              }
              dataType={this.props.dataType ? this.props.dataType : ""}
              radius={this.props.radius ? this.props.radius : 85}
              labels={this.props.labels === true ? true : false}
              hideValueAndShowAxis={this.props.hideValueAndShowAxis}
              templateName={this.props.templateName}
              slideName={this.props.slideName}
              headingColor={this.props.headingColor}
              alternateHeading={this.props.alternateHeading}
              isLibraryReport={this.props.isLibraryReport}
            />
          </>
        ) : (
          <div width={this.props.width} height={this.props.height}>
            Graph Not Available
          </div>
        )}
      </>
    );
  }
}
