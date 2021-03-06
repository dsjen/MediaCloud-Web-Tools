import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import withAsyncFetch from '../../common/hocs/AsyncContainer';
import withCsvDownloadNotifyContainer from '../../common/hocs/CsvDownloadNotifyContainer';
import withSummary from '../../common/hocs/SummarizedVizualization';
import { fetchTopicTopStories, sortTopicTopStories, filterByFocus } from '../../../actions/topicActions';
import Permissioned from '../../common/Permissioned';
import { getUserRoles, hasPermissions, PERMISSION_LOGGED_IN } from '../../../lib/auth';
import { DownloadButton } from '../../common/IconButton';
import ActionMenu from '../../common/ActionMenu';
import TopicStoryTable from '../TopicStoryTable';
import messages from '../../../resources/messages';
import { filteredLinkTo, filteredLocation, filtersAsUrlParams } from '../../util/location';
import { HELP_STORIES_CSV_COLUMNS } from '../../../lib/helpConstants';

const localMessages = {
  title: { id: 'topic.summary.stories.title', defaultMessage: 'Top Stories' },
  descriptionIntro: { id: 'topic.summary.stories.help.title', defaultMessage: '<p>The top stories within this topic can suggest the main ways it is talked about.  Sort by different measures to get a better picture of a story\'s influence.</p>' },
  downloadNoFBData: { id: 'topic.summary.stories.download.noFB', defaultMessage: 'Download CSV with all stories' },
  downloadWithFBData: { id: 'topic.summary.stories.download.withFB', defaultMessage: 'Download CSV with all stories & Facebook collection date (takes longer)' },
  downloadLinkCsv: { id: 'topic.summary.stories.download.downloadLinkCsv', defaultMessage: 'Download CSV of all story links' },
};

const NUM_TO_SHOW = 10;

class StoriesSummaryContainer extends React.Component {
  componentWillReceiveProps(nextProps) {
    const { filters, sort, fetchData } = this.props;
    if ((nextProps.filters !== filters) || (nextProps.sort !== sort)) {
      fetchData(nextProps);
    }
  }

  onChangeSort = (newSort) => {
    const { sortData } = this.props;
    sortData(newSort);
  };

  downloadCsvNoFBData = () => {
    const { filters, sort, topicId, notifyOfCsvDownload } = this.props;
    const url = `/api/topics/${topicId}/stories.csv?${filtersAsUrlParams(filters)}&sort=${sort}`;
    window.location = url;
    notifyOfCsvDownload(HELP_STORIES_CSV_COLUMNS);
  }

  downloadCsvWithFBData = () => {
    const { filters, sort, topicId, notifyOfCsvDownload } = this.props;
    const url = `/api/topics/${topicId}/stories.csv?${filtersAsUrlParams(filters)}&sort=${sort}&fbData=1`;
    window.location = url;
    notifyOfCsvDownload(HELP_STORIES_CSV_COLUMNS);
  }

  downloadLinkCsv = () => {
    const { filters, sort, topicId } = this.props;
    const url = `/api/topics/${topicId}/stories/story-links.csv?${filtersAsUrlParams(filters)}&sort=${sort}&fbData=1`;
    window.location = url;
  }

  render() {
    const { stories, sort, topicId, handleFocusSelected, user, showTweetCounts } = this.props;
    const isLoggedIn = hasPermissions(getUserRoles(user), PERMISSION_LOGGED_IN);
    return (
      <React.Fragment>
        <TopicStoryTable
          stories={stories}
          showTweetCounts={showTweetCounts}
          topicId={topicId}
          onChangeSort={isLoggedIn ? this.onChangeSort : null}
          onChangeFocusSelection={handleFocusSelected}
          sortedBy={sort}
          maxTitleLength={50}
        />
        <Permissioned onlyRole={PERMISSION_LOGGED_IN}>
          <div className="actions">
            <ActionMenu actionTextMsg={messages.downloadOptions}>
              <MenuItem
                className="action-icon-menu-item"
                id="topic-summary-top-stories-download"
                onClick={this.downloadCsvNoFBData}
              >
                <ListItemText><FormattedMessage {...localMessages.downloadNoFBData} /></ListItemText>
                <ListItemIcon>
                  <DownloadButton />
                </ListItemIcon>
              </MenuItem>
              <MenuItem
                className="action-icon-menu-item"
                id="topic-summary-top-stories-download-with-facebook"
                onClick={this.downloadCsvWithFBData}
              >
                <ListItemText><FormattedMessage {...localMessages.downloadWithFBData} /></ListItemText>
                <ListItemIcon>
                  <DownloadButton />
                </ListItemIcon>
              </MenuItem>
              <MenuItem
                className="action-icon-menu-item"
                id="topic-summary-top-stories-download-links"
                onClick={this.downloadLinkCsv}
              >
                <ListItemText><FormattedMessage {...localMessages.downloadLinkCsv} /></ListItemText>
                <ListItemIcon>
                  <DownloadButton />
                </ListItemIcon>
              </MenuItem>
            </ActionMenu>
          </div>
        </Permissioned>
      </React.Fragment>
    );
  }
}

StoriesSummaryContainer.propTypes = {
  // from the composition chain
  intl: PropTypes.object.isRequired,
  notifyOfCsvDownload: PropTypes.func.isRequired,
  // from parent
  topicId: PropTypes.number.isRequired,
  filters: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  // from dispatch
  fetchData: PropTypes.func.isRequired,
  handleFocusSelected: PropTypes.func.isRequired,
  sortData: PropTypes.func.isRequired,
  handleExplore: PropTypes.func.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  sort: PropTypes.string.isRequired,
  stories: PropTypes.array,
  user: PropTypes.object,
  showTweetCounts: PropTypes.bool,
};

const mapStateToProps = state => ({
  fetchStatus: state.topics.selected.summary.topStories.fetchStatus,
  sort: state.topics.selected.summary.topStories.sort,
  stories: state.topics.selected.summary.topStories.stories,
  user: state.user,
  showTweetCounts: Boolean(state.topics.selected.info.ch_monitor_id),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchData: (props) => {
    const params = {
      ...props.filters,
      sort: props.sort,
      limit: NUM_TO_SHOW,
    };
    dispatch(fetchTopicTopStories(props.topicId, params));
  },
  handleFocusSelected: (focusId) => {
    const params = {
      ...ownProps.filters,
      focusId,
      timespanId: null,
    };
    const newLocation = filteredLocation(ownProps.location, params);
    dispatch(push(newLocation));
    dispatch(filterByFocus(focusId));
  },
  sortData: (sort) => {
    dispatch(sortTopicTopStories(sort));
  },
  handleExplore: () => {
    const exploreUrl = filteredLinkTo(`/topics/${ownProps.topicId}/stories`, ownProps.filters);
    dispatch(push(exploreUrl));
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    asyncFetch: () => {
      dispatchProps.fetchData({
        topicId: ownProps.topicId,
        filters: ownProps.filters,
        sort: stateProps.sort,
      });
    },
  });
}

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps, mergeProps)(
    withSummary(localMessages.title, localMessages.descriptionIntro, messages.storiesTableHelpText, true)(
      withAsyncFetch(
        withCsvDownloadNotifyContainer(
          StoriesSummaryContainer
        )
      )
    )
  )
);
