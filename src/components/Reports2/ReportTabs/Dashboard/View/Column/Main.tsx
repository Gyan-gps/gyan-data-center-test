// @ts-nocheck
import React, { Component } from "react";
import ReactFC from "fusion_modules/fusioncharts-suite-xt-master/integrations/react/js/react-fusioncharts";
import FusionCharts from "fusion_modules/fusioncharts-suite-xt-master/addlicense";
import Charts from "fusion_modules/fusioncharts-suite-xt-master/js/fusioncharts.charts";
import FusionTheme from "fusion_modules/fusioncharts-suite-xt-master/js/themes/fusioncharts.theme.fusion";

import SynapseLogo from '../../../../././../../assets/Synapse_logo.svg'

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

export default class Chart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [
        {
          label: "Venezuela",
          value: "290",
        },
        {
          label: "Saudi",
          value: "260",
        },
      ],
    };
  }

  componentDidMount() {
    if (this.props?.data &&  this.props?.data.length) {
      this.setState({
        data:  this.props.data,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps &&
      JSON.stringify(prevProps?.data) !== JSON.stringify(this.props?.data)
    ) {
      if (this.props?.data && this.props?.data.length) {
        this.setState({
          data: this.props.data,
        });
      }
    }
  }

  render() {
    let width = 400,
      height= 250,
      header = "",
      footer = "",
      id = `${Date.now()}`;

    if (this.props.width) width = this.props.width;
    if (this.props.height) height = this.props.height;
    if (this.props.header) header = this.props.header;
    if (this.props.footer) footer = this.props.footer;
    if (this.props.id) id = this.props.id;

    // const customSource = this.props.customObj?.column?.source;
    // const customMordorIcon = this.props.customObj?.column?.mordor_icon;
    
    const chartConfigs = {
      type: "column2d",
      dataFormat: "json",
      width: "100%",
      height: height,
      id: id,
      dataSource: {
        chart: {
          // logoURL: SynapseLogo,
          // logoPosition: "BR",
          theme: "fusion",
          animation: false,
          showAnchors: 1,
          exportEnabled: 1,
          exportShowMenuItem: this.props.id ? 0 : 1,
          exportFileName: `${header}`,
          exportFormats: "svg||png||jpg||pdf",
          exportAction: "download",

          formatNumberScale: 1,
          numberScaleValue: "1000,1000,1000,1000",
          numberScaleUnit: "k,M,B,T",

          adjustDiv: "0",
          numDivLines: "4",
          divLineColor: "#FFFFFF",
          divLineAlpha: "80",
          divLineDashed: "0",

          paletteColors: "#4A90E2",
          showValues: !this.props.hideValueAndShowAxis,
          rotateValues: this.props.rotateValues,
          valuePosition: "outside",
          placeValuesInside: "0",
          valueFont: "Avenir Heavy",
          valueFontSize: this.props.valueFontSize,
          valueFontBold: this.props.valueFontBold,
          valueFontColor: "#002F75",

          showYAxisLine: false,
          showYAxisValue: this.props.hideValueAndShowAxis,
          yAxisName: this.props.yAxisName,

          showXAxisLine: false,
          showXAxisValue: true,
          xAxisName: this.props.xAxisName,
          chartTopMargin: 75,
          chartBottomMargin:70,
          // chartTopMargin:
          //   width <= 516
          //     ? header?.length >= 60
          //       ? this.props.chartTopMargin + 55
          //       : this.props.chartTopMargin + 30
          //     : header?.length >= 100
          //     ? this.props.chartTopMargin + 55
          //     : this.props.chartTopMargin + 30,
          // chartBottomMargin: this.props.chartBottomMargin + 40,
          chartLeftMargin: 10,
          chartRightMargin: this.props.chartRightMargin,

          baseFont: "Avenir Medium",
          baseFontSize: 14,
          baseFontColor: "#7f7f7f",
        },

        annotations: {
          autoScale: "1",
          groups: [
            {
              id: "caption",
              items: [
                {
                  id: "dyn-label",
                  type: "text",
                  align: "left",
                  fillcolor: "#002F75",
                  // bgColor: "#E0EFFA",
                  width: `${width}`,
                  fontsize: this.props.headingColor ? 15 : 16,
                  font: "Avenir Medium",
                  text: (header + "").toUpperCase(),
                  bold: "0",
                  wrap: "1",
                  wrapWidth: this.props.wrapWidth,
                  x: `${this.props.xHeadingMargin + 20}`,
                  y: `${this.props.yHeadingMargin + 7}`,
                },

                {
                  id: "dyn-label-bg",
                  type: "rectangle",
                  // showBorder: "1",
                  // borderColor: "12345d",

                  fillcolor: this.props.headingColor,
                  x: "$canvasStartY-80",
                  y: "$canvasStartY-170",
                  tox: "$canvasEndX+300",
                  toy: "$canvasStartY-36",
                },
                {
                  id: "source",
                  type: "text",
                  align: "left",
                  fillcolor: "#7f7f7f",
                  fontsize: 12,
                  font: "Avenir Medium",
                  text: this.props.source ?? "Source: Mordor Intelligence",
                  bold: "0",
                  wrap: "1",
                  wrapWidth: width,
                  x: !this.props.hideValueAndShowAxis ?
                   "$canvasStartX" :  "$canvasStartX-35",
                  y:"$xaxis.0.label.0.starty + 75",
                },
                {
                  id: "mordor-icon",
                  type: "image",
                  url: SynapseLogo,
                  x: "$canvasEndX-145",
                  y:"$xaxis.0.label.0.starty + 50",
                },
              ],
            },
          ],
        },

        data: this.state.data,
      },
    };

    if (this.props.subheading) {
      chartConfigs.dataSource.annotations.groups.push({
        id: "sub_caption",
        items: [
          {
            id: "dyn-sub-caption",
            type: "text",
            align: "left",
            fillcolor: "#002F75",
            // bgColor: "#E0EFFA",
            width: `${width}`,
            fontsize: this.props?.headingColor ? 13 : 14,
            font: "Avenir Medium",
            text: this.props.subheading.toUpperCase(),
            bold: "0",
            wrap: "1",
            wrapWidth: this.props.wrapWidth,
            x: `${20}`,
            y: `${50}`,
          },
        ],
      });
    } else if (this.props.subheading === "") {
      chartConfigs.dataSource.annotations.groups.push({
        id: "sub_caption",
        items: [
          {
            id: "dyn-sub-caption",
            type: "text",
            align: "left",
            fillcolor: "#002F75",
            // bgColor: "#E0EFFA",
            width: `${width}`,
            fontsize: this.props?.headingColor ? 15 : 16,
            font: "Avenir Medium",
            text: "All Graph".toUpperCase(),
            bold: "0",
            wrap: "1",
            wrapWidth: this.props.wrapWidth,
            x: `${20}`,
            y: `${50}`,
          },
        ],
      });
    }

    return (
      <div>
        <ReactFC {...chartConfigs} />
      </div>
    );
  }
}
