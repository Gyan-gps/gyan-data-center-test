// @ts-nocheck
import React, { Component } from "react";
import ReactFC from "fusion_modules/fusioncharts-suite-xt-master/integrations/react/js/react-fusioncharts";
import FusionCharts from "fusion_modules/fusioncharts-suite-xt-master/addlicense";
import Charts from "fusion_modules/fusioncharts-suite-xt-master/js/fusioncharts.charts";
import FusionTheme from "fusion_modules/fusioncharts-suite-xt-master/js/themes/fusioncharts.theme.fusion";
import { COLORS } from '../../../../../../utils/graphs.configs.tsx'
import SynapseLogo from '../../../../././../../assets/Synapse_logo.svg'
ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);

const COLOR = (COLORS + "").split(",").map((color) => color.trim());

export default class Chart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [
        {
          category: [
            {
              label: "2018"
            },
            {
              label: "2019"
            },
            {
              label: "2020"
            }
          ]
        }
      ],

      dataset: [
        {
          seriesname: "Apple App Store",
          data: [
            {
              value: "1962576"
            },
            {
              value: "1798024"
            },
            {
              value: "1961897"
            },
            {
              value: "1903654"
            },
            {
              value: "1642759"
            }
          ]
        },
        {
          seriesname: "Google Play Store",
          data: [
            {
              value: "2108450"
            },
            {
              value: "2469894"
            },
            {
              value: "2868084"
            },
            {
              value: "4229856"
            },
            {
              value: "3553050"
            }
          ]
        }
      ]
  }
}


  componentDidMount() {
    if (this.props?.data) {
      this.setState({
          categories: this.props?.data?.categories,
          dataset: this.props?.data?.dataset
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState &&
      JSON.stringify(prevState?.dataset) !== JSON.stringify(this.props?.data?.dataset)
    ) {
      if (this.props?.data) {
        this.setState({
          categories: this.props?.data?.categories,
          dataset: this.props?.data?.dataset
        });
      }
    }
  }

  render() {

    let width,
      height,
      header,
      footer,
      data,
      id = `${Date.now()}`;



    if (this.props.width) width = this.props.width;
    if (this.props.height) height = this.props.height;
    if (this.props.header) header = this.props.header;
    if (this.props.footer) footer = this.props.footer;
    if (this.state.data) data = this.state.data;
    if (this.props.id) id = this.props.id;



    const newdataset = this.state.dataset.map((item, i)=>{
      return {...item, color: COLOR[i] }
    })

    const chartConfigs = {
      type: "mscolumn2d",
      dataFormat: "json",
      width: width,
      height: height,
      id: id,
      dataSource: {
        chart: {
          theme: "fusion",
          logoURL: SynapseLogo,
          logoPosition: "BR",
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
          rotateValues: false,
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

          chartTopMargin:75,
          chartBottomMargin: 30,
          chartLeftMargin:  20,
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
                  fontsize: this.props?.headingColor ? 15 : 16,
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
                  x: !this.props.hideValueAndShowAxis  ? "$canvasStartX-10" : "$canvasStartX-50",
                  y: "$legendEndY+14",
                },
              ],
            },
          ],
        },
        categories: this.state.categories,
        dataset:  newdataset//this.state.dataset
      },
    };

    return (
      <div>
        <ReactFC {...chartConfigs} />
      </div>
    );
  }
}
