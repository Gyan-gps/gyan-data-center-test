// @ts-nocheck
import React, { Component } from "react";
import ReactFC from "fusion_modules/fusioncharts-suite-xt-master/integrations/react/js/react-fusioncharts";
import FusionCharts from "fusion_modules/fusioncharts-suite-xt-master/addlicense";
import Charts from "fusion_modules/fusioncharts-suite-xt-master/js/fusioncharts.charts";
import FusionTheme from "fusion_modules/fusioncharts-suite-xt-master/js/themes/fusioncharts.theme.fusion";

import { COLORS } from '../../../../../../utils/graphs.configs.tsx'
import {
  breakLabel,
  data_length,
  placeValueOutside,
  removeLegends,
} from "../../../../../../utils/graphs.helperFunctions";

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
        {
          label: "Canada",
          value: "180",
        },
        {
          label: "Iran",
          value: "140",
        },
        {
          label: "Russia",
          value: "115",
        },
        {
          label: "UAE",
          value: "100",
        },
        {
          label: "US",
          value: "30",
        },
        {
          label: "China",
          value: "30",
        },
      ],
    };
    this.bytesToString = this.bytesToString.bind(this);
  }

  componentDidMount() {
    if (this.props.data) {
      let datas = [];
      for (const item of this.props.data) {
        if (this.props.width < 600 && item.label.length >= 24) {
          item.label = breakLabel(item.label, 24);
        }

        if (item.value < 0) {
          item.value = 0 - item.value;
        }

        datas.push(item);
      }
      const legends_zero_elimination =
        this.props.legends_zero_elimination === false ? false : true;

      if (legends_zero_elimination === true) datas = removeLegends(datas);
      placeValueOutside(datas);
      datas = datas.reverse();
      this.setState({
        data: datas,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps &&
      JSON.stringify(prevProps.data) !== JSON.stringify(this.props.data)
    ) {
      let datas = [];
      for (const item of this.props.data) {
        if (this.props.width < 600 && item.label.length >= 24) {
          item.label = breakLabel(item.label, 24);
        }

        if (item.value < 0) {
          item.value = 0 - item.value;
        }
        datas.push(item);
      }

      const legends_zero_elimination =
        this.props.legends_zero_elimination === false ? false : true;

      if (legends_zero_elimination === true) datas = removeLegends(datas);
      placeValueOutside(datas);
      datas = datas.reverse();
      this.setState({
        data: datas,
      });
    }
  }

  bytesToString(d, width) {
    let number_of_letter = width / 7 + 10;
    if (width === 1) number_of_letter = (400 - 150) / 9;
    if (width === 2) number_of_letter = this.props.width / 16;

    let str = "";
    const computed_array = [];
    const string_arr = d.trim().split(" ");
    for (const item of string_arr) {
      if ((item + str).length >= number_of_letter) {
        computed_array.push(str);
        str = "";
      }
      str += " " + item;
    }
    if (str !== "") computed_array.push(str);

    let caption = "";
    for (let i = 0; i < computed_array.length; i++) {
      if (i !== computed_array.length - 1) {
        caption += computed_array[i] + "<br/>";
      } else caption += computed_array[i];
    }
    return caption;
  }

  render() {


    let width = 400,
        height = 250,
        labels = false,
      radius = 85,
      centerlabel = "",
      legends = true,
      header = "",
      legendNumColumns = 1,
      datalength = 0,
      id = `${Date.now()}`;


    

    if (this.props.width) width = this.props.width;
    if (this.props.height) height = this.props.height;
    if (this.props.header) header = this.props.header;
    if (this.props.labels) labels = this.props.labels;
    if (this.props.radius) radius = this.props.radius;
    if (this.props.id) id = this.props.id;

    if (this.props.centerlabel) centerlabel = this.props.centerlabel;
    if (this.props && this.props.legends === false)
      legends = this.props.legends;
    if (this.state.data.length >= 11) legendNumColumns = 2;
    datalength = data_length(this.state.data);
    const customSource = this.props.customObj?.pie?.source;
    const customMordorIcon = this.props.customObj?.pie?.mordor_icon;

    const computeYAxis = (preCal) => {
      if (this.state?.data.length > 8) {
        const yAxis = 0;
        const totalRow = this.state?.data.length / 5;
        const totalRowRounded = Math.ceil(totalRow);
        const final = (totalRowRounded * 21).toString();
        return preCal + "+" + final.toString();
      } else {
        return preCal;
      }
    };

    const chartConfigs = {
      type: "doughnut2d",
      dataFormat: "json",
      width: "100%",
      height: height,
      id: id,
      dataSource: {
        chart: {
          logoURL: SynapseLogo,
          logoPosition: "BR",
          theme: "fusion",
          animation: false,
          showAnchors: 1,
          exportEnabled: 1,
          exportShowMenuItem: this.props.id ? 0 : 1,
          exportFileName: `${header}`,
          exportFormats: "svg||png||jpg||pdf",
          exportAction: "download",

          decimals: 1,
          showPlotBorder: "0",
          paletteColors: (COLORS + "")
            .split(",")
            .slice(0, this.state.data.length)
            .reverse()
            .join(","),

          pieBorderThickness: "1",
          pieBorderColor: "#ffffff",
          minAngleForValue: 3,
          pieRadius: radius + 1,

          showValues: !this.props.dataHidden,
          showPercentValues: !this.props.dataHidden,
          valuePosition: "Inside",
          showpercentvalues: "1",
          showPercentInToolTip: "1",

          showLabels: labels,
          labelFontSize: 11,
          labelFontBold: true,
          labelFontColor: "#ffffff",
          labelFont: "Avenir Heavy",
          labelPosition: "Inside",
          labelDistance: "0",
          smartLabelClearance: "5",
          enableSmartLabels: "1",
          skipOverlapLabels: "0",
          usedataplotcolorforlabels: "1",

          defaultCenterLabel: "" + centerlabel,
          centerLabel: "" + centerlabel,
          doughnutRadius: "30",
          showLegend: true,
          legendItemFont: "Avenir Medium",
          legendItemFontColor: "#7f7f7f",
          reverseLegend: "1",
          legendPosition: this.props.isLibraryReport ? "right" : "bottom-left",
          legendCaptionFontBold: true,
          legendItemFontSize: this.state.data.length > 8 ? 11 : 14,
          chartRightMargin: this.props.isLibraryReport ? "80" : "" ,
          chartTopMargin: 10 + this.props.chartHeadingGap,
          // chartLeftMargin: !legends
          //   ? 0
          //   : -210 + (width / 2 - 173) + (400 - width) + 20,

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
                  toy: "$canvasStartY+25",
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
                  x: "$canvasStartX-10",
                  y: this.props.isLibraryReport ? "$canvasEndY+15"  : "$legendEndY+20",
                },
              ],
            },
          ],
        },
        data: this.state.data,
      },
    };


    if(this.props.isLibraryReport && this.state.data?.length > 15){
      chartConfigs.dataSource.chart.legendNumColumns = this.state.data?.length > 20 ? 2 : 1;
      chartConfigs.dataSource.chart.legendPosition= "absolute";
      chartConfigs.dataSource.chart.legendXPosition= "500";
      chartConfigs.dataSource.chart.legendYPosition="40" ;
    }


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
            fontsize: this.props?.headingColor ? 13 : 14,
            font: "Avenir Medium",
            text: "All Graph".toUpperCase(),
            bold: "0",
            wrap: "1",
            wrapWidth: this.props.wrapWidth - 400,
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
