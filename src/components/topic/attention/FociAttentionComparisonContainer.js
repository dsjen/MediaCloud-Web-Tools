import PropTypes from 'prop-types';
import React from 'react';
import * as d3 from 'd3';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Row, Col } from 'react-flexbox-grid/lib';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ActionMenu from '../../common/ActionMenu';
import { fetchTopicSplitStoryCounts, fetchTopicFocalSetSplitStoryCounts } from '../../../actions/topicActions';
import withAsyncFetch from '../../common/hocs/AsyncContainer';
import withAttentionAggregation from '../../common/hocs/AttentionAggregation';
import DataCard from '../../common/DataCard';
import AttentionOverTimeChart, { dataAsSeries } from '../../vis/AttentionOverTimeChart';
import PackedBubbleChart from '../../vis/PackedBubbleChart';
import { DownloadButton } from '../../common/IconButton';
import messages from '../../../resources/messages';
import { downloadSvg } from '../../util/svg';
import { LINE_VIEW, STACKED_VIEW } from '../../../lib/visUtil';

const localMessages = {
  overallSeries: { id: 'topic.attention.series.overall', defaultMessage: 'Whole Topic' },
  comparisonTitle: { id: 'topic.attention.comparisonTitle.title', defaultMessage: 'Compare Subtopic Attention Over Time' },
  bubbleChartTitle: { id: 'topic.attention.bubbleChart.title', defaultMessage: 'Total Stories in Each Subtopic' },
  lineChartTitle: { id: 'topic.attention.lineChart.title', defaultMessage: 'Total Stories over Time in Each Subtopic' },
  stackedView: { id: 'topic.attention.view.stacked', defaultMessage: 'Stacked Area View' },
  lineView: { id: 'topic.attention.view.line', defaultMessage: 'Line View' },
};

const COLORS = d3.schemeCategory10;
const BUBBLE_CHART_DOM_ID = 'total-attention-bubble-chart';
const TOP_N_LABELS_TO_SHOW = 3; // only the top N bubbles will get a label visible on them (so the text is readable)

class FociAttentionComparisonContainer extends React.Component {
  state = {
    view: LINE_VIEW,
  }

  componentWillReceiveProps(nextProps) {
    const { selectedFocalSetId, filters, fetchData } = this.props;
    if ((nextProps.selectedFocalSetId !== selectedFocalSetId) || (nextProps.filters.timespanId !== filters.timespanId)) {
      fetchData(nextProps.topicId, nextProps.selectedFocalSetId, nextProps.filters);
    }
  }

  setView = (nextView) => {
    this.setState({ view: nextView });
  }

  render() {
    const { foci, overallTotal, overallCounts, attentionAggregationMenuItems, selectedTimePeriod } = this.props;
    const { formatMessage, formatNumber } = this.props.intl;
    // stich together bubble chart data
    const stackedAreaView = (
      <div>
        <MenuItem
          className="action-icon-menu-item"
          disabled={this.state.view === LINE_VIEW}
          onClick={() => this.setView(LINE_VIEW)}
        >
          <ListItemText><FormattedMessage {...localMessages.lineView} /></ListItemText>
        </MenuItem>
        <MenuItem
          className="action-icon-menu-item"
          disabled={this.state.view === STACKED_VIEW}
          onClick={() => this.setView(STACKED_VIEW)}
        >
          <ListItemText><FormattedMessage {...localMessages.stackedView} /></ListItemText>
        </MenuItem>
      </div>
    );
    let bubbleData = [];
    if (foci !== undefined && foci.length > 0) {
      bubbleData = [
        ...foci.sort((a, b) => b.total - a.total).map((focus, idx) => ({
          value: focus.total,
          centerText: (idx < TOP_N_LABELS_TO_SHOW) ? focus.name : null,
          rolloverText: `${focus.name}: ${formatNumber(focus.total)}`,
          fill: COLORS[idx + 1],
        })),
        {
          value: overallTotal,
          centerText: formatMessage(localMessages.overallSeries),
          rolloverText: `${formatMessage(localMessages.overallSeries)}: ${formatNumber(overallTotal)}`,
          fill: COLORS[0],
        },
      ];
    }
    // stich together line chart data
    let series = [];
    if (foci !== undefined) {
      series = foci.map((focus, idx) => { // add series for all the foci
        const data = dataAsSeries(focus.counts);
        return {
          id: idx,
          name: focus.name,
          ...data,
          color: COLORS[idx + 1],
        };
      });
      if (this.state.view !== STACKED_VIEW) { // now add a series for the whole thing (if not stacked)
        const overallData = dataAsSeries(overallCounts);
        series.push({
          id: 9999,
          name: formatMessage(localMessages.overallSeries),
          ...overallData,
          color: COLORS[0],
        });
      }
    }
    return (
      <React.Fragment>
        <Row>
          <Col lg={12}>
            <DataCard>
              <div className="actions">
                <ActionMenu actionTextMsg={messages.viewOptions}>
                  {stackedAreaView}
                  <Divider />
                  {attentionAggregationMenuItems}
                </ActionMenu>
              </div>
              <h2><FormattedMessage {...localMessages.comparisonTitle} /></h2>
              <AttentionOverTimeChart
                series={series}
                height={350}
                display={this.state.view}
                interval={selectedTimePeriod}
              />
            </DataCard>
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <DataCard>
              <div className="actions">
                <DownloadButton
                  tooltip={formatMessage(messages.download)}
                  onClick={() => downloadSvg(BUBBLE_CHART_DOM_ID)}
                />
              </div>
              <h2><FormattedMessage {...localMessages.bubbleChartTitle} /></h2>
              <PackedBubbleChart
                data={bubbleData}
                height={400}
                domId={BUBBLE_CHART_DOM_ID}
              />
            </DataCard>
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}

FociAttentionComparisonContainer.propTypes = {
  // from parent
  filters: PropTypes.object.isRequired,
  selectedFocalSetId: PropTypes.number.isRequired,
  topicId: PropTypes.number.isRequired,
  // from composition
  intl: PropTypes.object.isRequired,
  selectedTimePeriod: PropTypes.string.isRequired,
  attentionAggregationMenuItems: PropTypes.object.isRequired, // from hoc
  // from dispatch
  fetchData: PropTypes.func.isRequired,
  // from mergeProps
  asyncFetch: PropTypes.func.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  foci: PropTypes.array.isRequired,
  overallTotal: PropTypes.number.isRequired,
  overallCounts: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.topics.selected.attention.fetchStatus,
  foci: state.topics.selected.attention.foci,
  overallTotal: state.topics.selected.summary.splitStoryCount.total,
  overallCounts: state.topics.selected.summary.splitStoryCount.counts,
});

const mapDispatchToProps = dispatch => ({
  fetchData: (topicId, focalSetId, filters) => {
    if (topicId !== null) {
      if ((focalSetId !== null) && (focalSetId !== undefined)) {
        // fetch the total counts, then counts for each foci
        dispatch(fetchTopicSplitStoryCounts(topicId, filters))
          .then(() => dispatch(fetchTopicFocalSetSplitStoryCounts(topicId, focalSetId, filters)));
      }
    }
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    asyncFetch: () => {
      dispatchProps.fetchData(ownProps.topicId, ownProps.selectedFocalSetId, ownProps.filters);
    },
  });
}

export default
connect(mapStateToProps, mapDispatchToProps, mergeProps)(
  withAttentionAggregation(
    withAsyncFetch(
      injectIntl(
        FociAttentionComparisonContainer
      )
    )
  )
);
