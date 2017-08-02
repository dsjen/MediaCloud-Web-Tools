import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { fetchMediaStories, sortMediaStories, filterByFocus } from '../../../actions/topicActions';
import composeAsyncContainer from '../../common/AsyncContainer';
import composeHelpfulContainer from '../../common/HelpfulContainer';
import messages from '../../../resources/messages';
import TopicStoryTable from '../TopicStoryTable';
import { filteredLocation } from '../../util/location';
import DataCard from '../../common/DataCard';
import { DownloadButton } from '../../common/IconButton';

const STORIES_TO_SHOW = 10;

const localMessages = {
  helpTitle: { id: 'media.stories.help.title', defaultMessage: 'About Media Stories' },
  helpIntro: { id: 'media.stories.help.intro', defaultMessage: '<p>This is a table of stories published by this Media Source within the Topic.</p>' },
};

class MediaStoriesContainer extends React.Component {
  componentWillReceiveProps(nextProps) {
    const { fetchData, filters, sort } = this.props;
    if ((nextProps.filters.timespanId !== filters.timespanId) ||
      (nextProps.sort !== sort)) {
      fetchData(nextProps);
    }
  }
  onChangeSort = (newSort) => {
    const { sortData } = this.props;
    sortData(newSort);
  }
  downloadCsv = () => {
    const { mediaId, topicId, filters } = this.props;
    const url = `/api/topics/${topicId}/media/${mediaId}/stories.csv?timespanId=${filters.timespanId}`;
    window.location = url;
  }
  render() {
    const { inlinkedStories, topicId, helpButton, handleFocusSelected } = this.props;
    const { formatMessage } = this.props.intl;
    return (
      <DataCard>
        <div className="actions">
          <DownloadButton tooltip={formatMessage(messages.download)} onClick={this.downloadCsv} />
        </div>
        <h2>
          <FormattedMessage {...messages.storyPlural} />
          {helpButton}
        </h2>
        <TopicStoryTable
          stories={inlinkedStories}
          topicId={topicId}
          onChangeSort={this.onChangeSort}
          onChangeFocusSelection={handleFocusSelected}
        />
      </DataCard>
    );
  }
}

MediaStoriesContainer.propTypes = {
  // from composition chain
  intl: React.PropTypes.object.isRequired,
  helpButton: React.PropTypes.node.isRequired,
  // from parent
  mediaId: React.PropTypes.number.isRequired,
  topicId: React.PropTypes.number.isRequired,
  location: React.PropTypes.object.isRequired,
  // from mergeProps
  asyncFetch: React.PropTypes.func.isRequired,
  // from fetchData
  fetchData: React.PropTypes.func.isRequired,
  sortData: React.PropTypes.func.isRequired,
  handleFocusSelected: React.PropTypes.func.isRequired,
  // from state
  sort: React.PropTypes.string.isRequired,
  filters: React.PropTypes.object.isRequired,
  fetchStatus: React.PropTypes.string.isRequired,
  inlinkedStories: React.PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.topics.selected.mediaSource.stories.fetchStatus,
  inlinkedStories: state.topics.selected.mediaSource.stories.stories,
  sort: state.topics.selected.mediaSource.stories.sort,
  filters: state.topics.selected.filters,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchData: (stateProps) => {
    const params = {
      ...stateProps.filters,
      sort: stateProps.sort,
      limit: STORIES_TO_SHOW,
    };
    dispatch(fetchMediaStories(ownProps.topicId, ownProps.mediaId, params));
  },
  handleFocusSelected: (focusId) => {
    const newLocation = filteredLocation(ownProps.location, { focusId, timespanId: null });
    dispatch(push(newLocation));
    dispatch(filterByFocus(focusId));
  },
  sortData: (sort) => {
    dispatch(sortMediaStories(sort));
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    asyncFetch: () => {
      dispatchProps.fetchData(stateProps);
    },
  });
}

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps, mergeProps)(
      composeHelpfulContainer(localMessages.helpTitle, [localMessages.helpIntro, messages.storiesTableHelpText])(
        composeAsyncContainer(
          MediaStoriesContainer
        )
      )
    )
  );
