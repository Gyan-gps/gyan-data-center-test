// @ts-nocheck
import React, { Component } from "react";
import ReactFC from "fusion_modules/fusioncharts-suite-xt-master/integrations/react/js/react-fusioncharts";
import FusionCharts from "fusion_modules/fusioncharts-suite-xt-master/addlicense";
import Charts from "fusion_modules/fusioncharts-suite-xt-master/js/fusioncharts.powercharts";
import FusionTheme from "fusion_modules/fusioncharts-suite-xt-master/js/themes/fusioncharts.theme.fusion";

import {
  roundOfMaxYAxisValue,
  roundOfpositive_NegativeMaxValue,
} from "../../../../../../utils/graphs.helperFunctions";
import SynapseLogo from '../../../../././../../assets/Synapse_logo.svg'

ReactFC.fcRoot(FusionCharts, Charts, FusionTheme);
// FusionCharts.options.export.useCanvas = "true";

export default class Chart extends Component {
  state = {
    pmaxYaxisValue: 0,
    smaxYaxisValue: 0,
    data: [
      {
        label: "2002",
        value: 36,
        volume: 6,
      },
      {
        label: "2003",
        value: 27,
        volume: 7,
      },
      {
        label: "2004",
        value: 8,
        volume: 8,
      },
      {
        label: "2005",
        value: 10,
        volume: 10,
      },
      {
        label: "2006",
        value: 20,
        volume: 13,
      },
      {
        label: "2007",
        value: 14,
        volume: 14,
      },
      {
        label: "2008",
        value: 15,
        volume: 15,
      },
      {
        label: "2009",
        value: 17,
        volume: 17,
      },
      {
        label: "2010",
        value: 7,
        volume: 7,
      },
      {
        label: "2011",
        value: 48,
        volume: 8,
      },
      {
        label: "2012",
        value: 29,
        volume: 10,
      },
      {
        label: "2013",
        value: 3,
        volume: 13,
      },
      {
        label: "2014",
        value: 20,
        volume: 14,
      },
      {
        label: "2015",
        value: 15,
        volume: 15,
      },
      {
        label: "2016",
        value: 30,
        volume: 17,
      },
      {
        label: "2017",
        value: 10,
        volume: 20,
      },
      {
        label: "2018",
        value: 10,
        volume: 2,
      },
      {
        label: "2019",
        value: 1,
        volume: 20,
      },
      {
        label: "2020",
        value: 10,
        volume: 20,
      },
    ],
    label: [],
    volume: [],
    value: [],
  };

  componentDidMount() {
    const data = this.props.data;
    let catagory = [],
      BarData = [],
      LineData = [],
      parr = [],
      sarr = [];
    for (let item of data) {
      let label = {
        label: item.label,
      };
      catagory.push(label);
      let volume = {
        value: item.volume,
        // eslint-disable-next-line no-prototype-builtins
        showValue: this.props?.hasOwnProperty("meta")
          ? this.props?.meta?.includes(Number(item.label))
            ? true
            : false
          : true,
      };
      BarData.push(volume);
      const value = {
        value: item.value,
      };
      if ((item.label + "").substring(0, 4) === "2020")
        volume = {
          ...volume,
          showValue: 1,
        };
      parr.push(item.volume);
      sarr.push(item.value);
      LineData.push(value);
    }
    parr.sort(function (a, b) {
      if (a > b) return -1;
      else return 1;
    });
    sarr.sort(function (a, b) {
      if (a > b) return -1;
      else return 1;
    });
    this.setState({
      label: catagory,
      volume: BarData,
      value: LineData,
      data,
      pmaxYaxisValue: roundOfMaxYAxisValue(parr[0] * 1.7),
      smaxYaxisValue: roundOfpositive_NegativeMaxValue(
        sarr[0],
        sarr[sarr.length - 1]
      ),
    });
  }

  formatNumberAbbreviation(paramNumber) {
    const value = Number(paramNumber);
    if (value >= 1e12) {
      return (value / 1e12).toFixed(2) + " T";
    } else if (value >= 1e9) {
      return (value / 1e9).toFixed(2) + " B";
    } else if (value >= 1e6) {
      return (value / 1e6).toFixed(2) + " M";
    } else if (value >= 1e3) {
      return (value / 1e3).toFixed(2) + " K";
    } else {
      return String(value.toFixed(2));
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState &&
      JSON.stringify(prevState.data) !== JSON.stringify(this.props.data)
    ) {
      const data = this.props.data;
      const catagory = [],
        BarData = [],
        LineData = [],
        parr = [],
        sarr = [];
      for (const item of data) {
        const label = {
          label: item.label,
        };
        catagory.push(label);

        let volume = {
          value: item.volume,
          // eslint-disable-next-line no-prototype-builtins
          showValue: this.props?.hasOwnProperty("meta")
            ? this.props?.meta?.includes(Number(item.label))
              ? true
              : false
            : true,
          toolText:
            this.formatNumberAbbreviation(item.volume) +
            " " +
            this.props.dynamiclegends[0],
        };
        BarData.push(volume);
        const value = {
          value: item.value,
          toolText:
            Number(item.value).toFixed(2) + "% " + this.props.dynamiclegends[1],
        };
        if ((item.label + "").substring(0, 4) === "2020")
          volume = {
            ...volume,
            showValue: 1,
          };
        parr.push(item.volume);
        sarr.push(item.value);
        LineData.push(value);
      }
      parr.sort(function (a, b) {
        if (a > b) return -1;
        else return 1;
      });
      sarr.sort(function (a, b) {
        if (a > b) return -1;
        else return 1;
      });
      this.setState({
        label: catagory,
        volume: BarData,
        value: LineData,
        data,
        pmaxYaxisValue: roundOfMaxYAxisValue(parr[0]),
        smaxYaxisValue: roundOfpositive_NegativeMaxValue(
          sarr[0],
          sarr[sarr.length - 1]
        ),
      });
    }
  }

  bytesToString = (d, width) => {
    let k = "";
    const computed_array = [];

    let number_of_letter = 0;
    number_of_letter = this.props.width / 4;

    let counter = 1,
      line = "";
    d = d + "";

    for (const item of d) {
      line += item;
      if (isNaN(item)) {
        counter++;
      } else {
        counter += 2;
      }
      if (counter >= number_of_letter) {
        if (
          d.charAt(k.length + line.length - 1) !== " " &&
          d.charAt(k.length + line.length) !== " " &&
          k.length + line.length !== d.length
        ) {
          k += line;
          line += "-";
        } else k += line;
        computed_array.push(line);
        line = "";
        counter = 1;
      }
    }
    if (counter < number_of_letter) computed_array.push(line);

    let caption = "";
    for (let i = 0; i < computed_array.length; i++) {
      if (i !== computed_array.length - 1)
        caption += computed_array[i] + "<br/>";
      else caption += computed_array[i];
    }
    return caption;
  };

 

  render() {
    let width,
      id= `${Date.now()}`,
      height,
      rotateValues = 0,
      legendPosition = "bottom",
      valueFontSize = 12,
      small = false,
      header = "",
      cagr_year = [2, 6],
      cagr_year_median = 0,
      arr = [],
      new_cagr_year = [],
      maxYaxisValue = 0;

    if (this.props.width) width = this.props.width;
    if (this.props.height) height = this.props.height;
    if (this.props.legendPosition) legendPosition = this.props.legendPosition;
    if (this.props.valueFontSize) valueFontSize = this.props.valueFontSize;
    if (this.props.header) header = this.props.header;
    if (this.props.rotateValues === 1) rotateValues = this.props.rotateValues;
    if (this.props.small) small = true;
    if (this.props.id)id = this.props.id;

    for (const [index, item] of [...this.props.data].entries()) {
      item.label = (item.label + "").split(" ")[0];
      if (
        this.props.data &&
        this.props.cagr_year &&
        this.props.cagr_year.length > 0
      ) {
        if (
          item.label === this.props.cagr_year[0] + "" ||
          item.label === this.props.cagr_year[1] + ""
        ) {
          new_cagr_year.push(index);
        }
      }
      arr.push(item.value);
      if (item.label === "2020") {
        item["showValue"] = true;
      }
    }

    arr.sort(function (a, b) {
      if (a > b) return -1;
      else return 1;
    });

    maxYaxisValue = roundOfMaxYAxisValue(arr[0]);
    cagr_year = new_cagr_year;
    cagr_year_median = Math.ceil((cagr_year[0] + cagr_year[1]) / 2);

    const chartConfigs = {
      type: "mscombidy2d",
      dataFormat: "json",
      width: width,
      id:id,
      height: height,
      dataSource: {
        chart: {
          theme: "fusion",
          animation: false,
          showanchors: 1,
          exportEnabled: 1,
          exportShowMenuItem: this.props.id ? 0: 1,
          exportFileName: `${header}`,
          exportFormats: 'svg||png||jpg||pdf',
          exportAction: 'download',

          formatNumberScale: 1,
          numberScaleValue: "1000,1000,1000",
          numberScaleUnit: "k,M,B",

          adjustDiv: "0",
          numDivLines: "4",
          divLineColor: "#E5E5E5",
          divLineAlpha: "80",
          divLineDashed: "0",

          showLabels: true,
          labelFont: "Avenir Medium",
          labelFontColor: "#7f7f7f",
          labelFontSize: 14,
          rotateLabels: 0,

          legendPosition: legendPosition,
          legendCaptionFont: "Avenir Medium",
          legendItemFont: "Avenir Medium",
          legendItemFontSize: 14,
          legendItemFontColor: "#7f7f7f",

          ShowPlotBorder: "0",
          paletteColors: "#4A90E2,#D755A3",
          decimals: 1,
          plothighlighteffect: "fadeout",

          showvalues: "0",
          valueFont: "Avenir Heavy",
          valueFontColor: "#002F75",
          valueFontBold: false,
          valueFontSize: valueFontSize,
          rotateValues: rotateValues,

          showDivLineValues: "0",
          showLimits: "0",
          showSecondaryLimits: "1",

          showYAxisLine: false,
          yAxisLineColor: "#4A90E2",
          showYAxisValues: true,
          // showPYAxisValues: true,
          yAxisValueFont: "Avenir Medium",
          yAxisValueFontSize: 14,
          yAxisValueFontColor: "#7f7f7f",
          pYAxisValueDecimals: 0,
          sYAxisValueDecimals: 0,
          yAxisValueDecimals: "1",
          pYAxisMaxValue: this.state.pmaxYaxisValue,
          sYAxisMaxValue: this.state.smaxYaxisValue,
          sYAxisMinValue: Number(this.state.smaxYaxisValue) * -1,
          sNumberSuffix: " %",

          showXAxisLine: false,
          xAxisLineColor: "#4A90E2",
          showXAxisValues: true,
          xAxisValueFontColor: "#7f7f7f",
          xAxisValueFontSize: 14,
          centerXAxisName: false,
          chartTopMargin: this.props.allow_cagr
            ? 100 + this.props.chartHeadingGap
            : 50 + this.props.chartHeadingGap,
          chartBottomMargin: 10,
          chartLeftMargin: 4,

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
                  toy: "$canvasStartY-15",
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
                  x: "$canvasStartX+10",
                  y: "$canvasEndY+60",
                },
                {
                  id: "mordor-icon",
                  type: "image",
                  url: SynapseLogo,
                  x: "$canvasEndX-75",
                  y: "$canvasEndY+40",
                },
              ],
            },
          ],
        },
        categories: [
          {
            category: this.state.label,
          },
        ],
        dataset: [
          {
            seriesname: `${this.props.dynamiclegends[0]}`,
            parentyaxis: "P",
            plottooltext: `$value ${this.props.dynamiclegends[0]}`,
            placeValuesInside: "0",
            showValues: !this.props.dataHidden,
            data: this.state.volume,
            decimals: 0,
          },

          {
            seriesname: `${this.props.dynamiclegends[1]}(%)`,
            parentyaxis: "S",
            renderas: "line",
            showvalues: "0",
            plottooltext: `$value ${this.props.dynamiclegends[1]}`,
            data: this.state.value,
          },
        ],
      },
    };

    if (this.props.allow_cagr) {
      chartConfigs["dataSource"]["annotations"]["groups"].push({
        id: "infobar",
        items: [
          {
            id: "2",
            type: "line",
            x: `$dataset.0.set.${cagr_year[0]}.startx+25`,
            y: `$dataset.0.set.${cagr_year[0]}.starty-30`,
            tox: `$dataset.0.set.${cagr_year[0]}.startx+25`,
            toy: `$dataset.0.set.${cagr_year[1]}.starty-50`,
            color: "#2F9AC4",
            dashed: "0",
            thickness: "1",
          },
          {
            id: "2.1",
            type: "line",
            x: `$dataset.0.set.${cagr_year[0]}.startx+25`,
            y: `$dataset.0.set.${cagr_year[1]}.starty-50`,
            tox: `$dataset.0.set.${cagr_year_median}.startx-3`,
            toy: `$dataset.0.set.${cagr_year[1]}.starty-50`,
            color: "#2F9AC4",
            dashed: "0",
            thickness: "1",
          },
          {
            id: "2.2",
            type: "line",
            x: `$dataset.0.set.${cagr_year_median}.startx+53`,
            y: `$dataset.0.set.${cagr_year[1]}.starty-50`,
            tox: `$dataset.0.set.${cagr_year[1]}.startx+25`,
            toy: `$dataset.0.set.${cagr_year[1]}.starty-50`,
            color: "#2F9AC4",
            dashed: "0",
            thickness: "1",
          },
          {
            id: "2.2",
            type: "line",
            x: `$dataset.0.set.${cagr_year[1]}.startx+25`,
            y: `$dataset.0.set.${cagr_year[1]}.starty-50`,
            tox: `$dataset.0.set.${cagr_year[1]}.startx+25`,
            toy: `$dataset.0.set.${cagr_year[1]}.starty-30`,
            color: "#2F9AC4",
            dashed: "0",
            thickness: "1",
          },
          {
            id: "triangle-1",
            type: "polygon",
            startangle: "270",
            sides: "3",
            radius: "6",
            color: "#2F9AC4",
            x: `$dataset.0.set.${cagr_year[0]}.startx+25`,
            y: `$dataset.0.set.${cagr_year[0]}.starty-30`,
          },
          {
            id: "triangle-2",
            type: "polygon",
            startangle: "270",
            sides: "3",
            radius: "6",
            color: "2F9AC4",
            x: `$dataset.0.set.${cagr_year[1]}.startx+25`,
            y: `$dataset.0.set.${cagr_year[1]}.starty-30`,
          },
          {
            id: "circle-1",
            type: "arc",
            radius: "26",
            innerRadius: "27.5",
            color: "2F9AC4",
            x: `$dataset.0.set.${cagr_year_median}.startx+25`,
            y: `$dataset.0.set.${cagr_year[1]}.starty-50`,
          },
          {
            id: "cagr",
            type: "text",
            align: "center",
            fillcolor: "#002F75",
            fontsize: 12,
            font: "Avenir Medium",
            text: `${
              this.props.cagr_value ? this.props.cagr_value + "%" : "0%"
            } CAGR`,
            bold: "0",
            wrap: "1",
            wrapWidth: `${40}`,
            x: `$dataset.0.set.${cagr_year_median}.startx+25`,
            y: `$dataset.0.set.${cagr_year[1]}.starty-50`,
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
