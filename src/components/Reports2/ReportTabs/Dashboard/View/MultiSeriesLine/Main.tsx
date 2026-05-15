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
              label: "2021"
            }
          ]
        }
      ],
      dataset: [
        {
          seriesname: "Facebook",
          data: [
            {
              value: "68"
            },
            {
              value: "69"
            },
            {
              value: "69"
            },
            {
              value: "68"
            }
          ]
        },
        {
          seriesname: "Instagram",
          data: [
            {
              value: "35"
            },
            {
              value: "37"
            },
            {
              value: "40"
            },
            {
              value: "47"
            }
          ]
        }
      ]
    };
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
    if (this.props.id) id = this.props.id;

    if (this.state.data) data = this.state.data;

    const chartConfigs = {
      type: "msline",
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

          formatNumberScale: 1,
          numberScaleValue: "1000,1000,1000,1000",
          numberScaleUnit: "k,M,B,T",

          adjustDiv: "0",
          numDivLines: "4",
          divLineColor: "#FFFFFF",
          divLineAlpha: "80",
          divLineDashed: "0",

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

          // chartTopMargin:
          //   header?.length >= 65
          //     ? this.props.chartTopMargin + 25
          //     : this.props.chartTopMargin,
          chartTopMargin: 75,
          chartBottomMargin: 30,
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
                  fontsize: 16,
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
                  text: "Source: Mordor Intelligence",
                  bold: "0",
                  wrap: "1",
                  x: !this.props.hideValueAndShowAxis  ? "$canvasStartX-5" : "$canvasStartX-40",
                  y: "$legendEndY+10",
                }
              ],
            },
          ],
        },
        categories: this.state.categories,
        dataset: this.state.dataset
      },
    };

    return (
      <div>
        <ReactFC {...chartConfigs} />
      </div>
    );
  }
}
