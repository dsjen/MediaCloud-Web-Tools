import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedNumber, FormattedMessage } from 'react-intl';
import vegaEmbed from 'vega-embed';
import { getBrandDarkColor } from '../../styles/colors';
// import { getVisDate } from '../../lib/dateUtil';

// const SECS_PER_DAY = 1000 * 60 * 60 * 24;

// const DEFAULT_BACKGROUND_COLOR = '#FFFFFF';

// don't show dots on line if more than this many data points
const SERIES_MARKER_THRESHOLD = 30;

const localMessages = {
  // chartTitle: { id: 'chart.storiesOverTime.title', defaultMessage: 'Attention Over Time' },
  // tooltipSeriesName: { id: 'chart.storiesOverTime.tooltipSeriesName', defaultMessage: 'Query: {name}' },
  // tooltipText: { id: 'chart.storiesOverTime.tooltipText', defaultMessage: '{count} {count, plural, =1 {story} other {stories} }' },
  // normalizedTooltipText: { id: 'chart.storiesOverTime.normalizedTooltipText', defaultMessage: '{count}% of stories' },
  // seriesTitle: { id: 'chart.storiesOverTime.seriesTitle', defaultMessage: 'stories/day' },
  totalCount: { id: 'chart.storiesOverTime.totalCount',
    defaultMessage: 'We have collected {total, plural, =0 {No stories} one {One story} other {{formattedTotal} stories}}.',
  },
  // yAxisNormalizedTitle: { id: 'chart.storiesOverTime.series.yaxis', defaultMessage: 'percentage of stories' },
};

// function makePercentage(value) { return value * 100; }

/**
 * Pass in "data" if you are using one series, otherwise configure them yourself and pass in "series".
 */
class AttentionOverTimeChart extends React.Component {

  componentDidMount() {
    const { data, series, lineColor, height } = this.props;
    console.log(series);
    console.log(data);
    // let allSeries = null;
    // let values = null;
    // if (data !== undefined) {
      // clean up the data
      // const dates = data.map(d => d.date);
      // turning variable time unit into days
      // const intervalMs = SECS_PER_DAY * config.interval; // default is a day...
      // const intervalMs = SECS_PER_DAY; // default is a day...
      // const intervalDays = (SECS_PER_DAY * 1) / SECS_PER_DAY;
      // values = data.map(d => { count: (d.count / intervalDays), date: d.date });
    //   allSeries = [{
    //     id: 0,
    //     name: filename,
    //     color: config.lineColor,
    //     data: values,
    //     pointStart: dates[0],
    //     pointInterval: intervalMs,
    //     showInLegend: showLegend !== false,
    //   }];
    // }
    // TODO: handle multiple lines
    // } else if (series !== undefined && series.length > 0) {
    //   allSeries = series;
    //   config.plotOptions.series.marker.enabled = series[0].data ? (series[0].data.length < SERIES_MARKER_THRESHOLD) : false;
    // }
    // config.series = allSeries;

    // console.log(values);
    // const config = {
    //   $schema: 'https://vega.github.io/schema/vega-lite/v2.json',
    //   data: {
    //     values: data,
    //     // values,
    //   },
    //   height,
    //   width: 600, // TODO: pass in as prop or inherit from parent
    //   mark: { type: 'line', color: getBrandDarkColor() },
    //   encoding: {
    //     x: { field: 'date', type: 'temporal', axis: { title: '', tickCount: 7 } },
    //     y: { field: 'count', type: 'quantitative', axis: { title: 'stories/day' } },
    //     tooltip: [
    //       { field: 'date', type: 'temporal', nearest: true, on: 'mouseover' },
    //       { field: 'count', type: 'quantitative', nearest: true, on: 'mouseover' },
    //     ],
    //   },
    // };

    const config = {
      $schema: 'https://vega.github.io/schema/vega-lite/v2.json',
      data: {
        values: data,
      },
      width: 600,
      height,
      // mark: { type: 'line', color: getBrandDarkColor() },
      // encoding: {
      //   x: { field: 'date', type: 'temporal', axis: { title: '', tickCount: 7 } },
      //   y: { field: 'count', type: 'quantitative', axis: { title: 'stories/day' } },
      //   tooltip: [
      //     { field: 'date', type: 'temporal', nearest: true },
      //     { field: 'count', type: 'quantitative' },
      //   ],
      // },
      layer: [
        {
          encoding: {
            x: { field: 'date', type: 'temporal' },
            y: { field: 'count', type: 'quantitative' },
          },
          layer: [{
            // mark: 'line',
            mark: { type: 'line', color: getBrandDarkColor() },
          },
          {
            selection: {
              tooltip: {
                type: 'single',
                nearest: true,
                on: 'mouseover',
                encodings: [
                  'x',
                ],
                empty: 'none',
              },
            },
            mark: 'point',
            encoding: {
              opacity: {
                condition: {
                  selection: 'tooltip',
                  value: 1,
                },
                value: 0,
              },
            },
          }],
        },
        {
          transform: [
            {
              filter: {
                selection: 'tooltip',
              },
            },
          ],
          layer: [
            {
              mark: {
                type: 'rule',
                color: 'gray',
                // opacity: 0,
              },
              encoding: {
                x: {
                  type: 'temporal',
                  field: 'date',
                },
                // color: { value: 'red' },
                // size: { value: 5 },
              },
            },
            {
              mark: {
                type: 'square',
                size: 1000,
                // color: '#f4f5f7',
                fill: '#f4f5f7',
                stroke: getBrandDarkColor(),
                yOffset: -50,
              },
              encoding: {
                x: {
                  type: 'temporal',
                  field: 'date',
                },
                y: {
                  type: 'quantitative',
                  field: 'count',
                },
              },
            },
            {
              mark: {
                type: 'text',
                align: 'left',
                yOffset: -50,
                // dx: 5,
                // dy: -5,
                fontSize: 20,
              },
              encoding: {
                text: {
                  type: 'quantitative',
                  field: 'count',
                },
                // color: {
                //   type: 'nominal',
                //   field: 'symbol',
                // },
                x: {
                  type: 'temporal',
                  field: 'date',
                },
                y: {
                  type: 'quantitative',
                  field: 'count',
                },
              },
            },
          ],
        },
      ],
    };

    if (data.length < SERIES_MARKER_THRESHOLD) {
      config.mark.point = { color: 'red' };
    }
    // if (filename !== undefined) {
    //   config.exporting.filename = filename;
    // } else {
    //   config.exporting.filename = formatMessage(localMessages.seriesTitle);
    // }
    // if ((health !== null) && (health !== undefined)) {
    //   config.xAxis.plotLines = health.map(h => ({ className: 'health-plot-line', ...h }));
    // }
    if ((lineColor !== null) && (lineColor !== undefined)) {
      config.lineColor = lineColor;
    }
    // if ((interval !== null) && (interval !== undefined)) {
    //   config.interval = interval === 'day' ? 1 : 1; // does nothing right now
    // }

    vegaEmbed('#vis', config);
  }

  // getConfig() {
  //   const { backgroundColor, normalizeYAxis } = this.props;
  //   const { formatMessage, formatNumber } = this.props.intl;
  //   const config = {
  //     title: formatMessage(localMessages.chartTitle),
  //     lineColor: getBrandDarkColor(),
  //     interval: 1,
  //     chart: {
  //       type: 'spline',
  //       zoomType: 'x',
  //       backgroundColor: backgroundColor || DEFAULT_BACKGROUND_COLOR,
  //     },
  //     plotOptions: {
  //       series: {
  //         connectNulls: false,
  //         marker: {
  //           enabled: true,
  //         },
  //       },
  //     },
  //     xAxis: {
  //       type: 'datetime',
  //       dateTimeLabelFormats: {
  //         millisecond: '%m/%e/%y',
  //         second: '%m/%e/%y',
  //         minute: '%m/%e/%y',
  //         hour: '%m/%e/%y',
  //         day: '%m/%e/%y',
  //         week: '%m/%e/%y',
  //         month: '%m/%y',
  //         year: '%Y',
  //       },
  //     },
  //     tooltip: {
  //       pointFormatter: function afmtxn() {
  //         // important to name this, rather than use arrow function, so `this` is preserved to be what highcharts gives us
  //         const rounded = formatNumber(this.y, { style: 'decimal', maximumFractionDigits: 2 });
  //         const pct = formatNumber(this.y * 100, { style: 'decimal', maximumFractionDigits: 2 });
  //         const seriesName = this.series.name ? formatMessage(localMessages.tooltipSeriesName, { name: this.series.name }) : '';
  //         const val = normalizeYAxis === true ? formatMessage(localMessages.normalizedTooltipText, { count: pct }) : formatMessage(localMessages.tooltipText, { count: rounded });
  //         const thisDate = getVisDate(new Date(this.category));
  //         const nextDate = getVisDate(new Date(this.category + this.series.pointInterval));
  //         const intervalDays = this.series.pointInterval / SECS_PER_DAY;
  //         if (intervalDays > 1) {
  //           this.series.tooltipOptions.xDateFormat = `Date Range: ${thisDate} to ${nextDate}`;
  //         }
  //         return (`${seriesName}<br/>${val}`);
  //       },
  //     },
  //     yAxis: {
  //       labels: { formatter: function afxn() { return normalizeYAxis === true ? `${makePercentage(this.value)}%` : this.value; } },
  //       min: 0,
  //       title: { text: normalizeYAxis === true ? formatMessage(localMessages.yAxisNormalizedTitle) : formatMessage(localMessages.seriesTitle) },
  //     },
  //     exporting: {
  //     },
  //   };
  //   return config;

  // }


  render() {
    const { total, introText } = this.props;
    // const { total, data, series, height, interval, onDataPointClick, lineColor, health, filename, showLegend, introText } = this.props;
    // const { formatMessage } = this.props.intl;
    // // setup up custom chart configuration
    // const config = this.getConfig();
    // config.chart.height = height;
    const classNameForPath = 'stories-over-time-chart';

    // if (onDataPointClick) {
    //   config.plotOptions.series.allowPointSelect = true;
    //   config.plotOptions.series.point = {
    //     events: {
    //       click: function handleDataPointClick(evt) {
    //         const point0 = evt.point;
    //         const date0 = new Date(point0.x);
    //         // handle clicking on last point
    //         const point1 = (point0.index < (point0.series.data.length - 1)) ? point0.series.data[evt.point.index + 1] : point0;
    //         const date1 = new Date(point1.x);
    //         onDataPointClick(date0, date1, evt, this);   // preserve the highcharts "this", which is the chart
    //       },
    //     },
    //   };
    //   classNameForPath = 'sentences-over-time-chart-with-node-info';
    // }


    // show total if it is included
    let totalInfo = null;
    if (introText) {
      totalInfo = (<p>{introText}</p>);
    } else if ((total !== null) && (total !== undefined)) {
      totalInfo = (
        <p>
          <FormattedMessage
            {...localMessages.totalCount}
            values={{ total, formattedTotal: (<FormattedNumber value={total} />) }}
          />
        </p>
      );
    }


    // render out the chart
    return (
      <div className={classNameForPath}>
        {totalInfo}
        <div id="vis" />
      </div>
    );
  }

}

AttentionOverTimeChart.propTypes = {
  // from parent
  data: PropTypes.array,
  series: PropTypes.array,
  height: PropTypes.number.isRequired,
  lineColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  health: PropTypes.array,
  interval: PropTypes.string,
  onDataPointClick: PropTypes.func, // (date0, date1, evt, chartObj)
  total: PropTypes.number,
  introText: PropTypes.string,  // overrides automatic total string generation
  filename: PropTypes.string,
  showLegend: PropTypes.bool,
  normalizeYAxis: PropTypes.bool,
  // from composition chain
  intl: PropTypes.object.isRequired,
};

export default injectIntl(AttentionOverTimeChart);
