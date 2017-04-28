import React from 'react';
import { push } from 'react-router-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Row, Col } from 'react-flexbox-grid/lib';
import { SelectField, MenuItem } from 'material-ui';
import composeAsyncContainer from '../../common/AsyncContainer';
import { fetchTopicsList, setTopicListFilter } from '../../../actions/topicActions';
import { pagedLocation } from '../../util/location';
import composePagedContainer from '../../common/PagedContainer';
import TopicList from './TopicList';

const localMessages = {
  topicsListFilter: { id: 'topics.list.filter', defaultMessage: 'Filter Topics By: ' },
  topicsListPublic: { id: 'topics.list.public', defaultMessage: 'Public Topics' },
  topicsListFavorites: { id: 'topics.list.favorite', defaultMessage: 'Favorite Topics' },
  topicsListPersonal: { id: 'topics.list.personal', defaultMessage: 'Personal Topics' },
  noAccess: { id: 'topics.list.noAccess', defaultMessage: "Sorry, you don't have the permissions to view this list." },
};

class TopicListContainer extends React.Component {

  changeFilter = (filterType) => {
    const { setFilter } = this.props;
    setFilter(filterType);
  }

  render() {
    const { topics, currentFilter, nextButton, previousButton, showFavorites, onSetFavorited } = this.props;
    const { formatMessage } = this.props.intl;
    let whichTopics = topics;
    let titleContent = null;

    // if the user has favorites => is logged_in => isn't logged in, show topics by filter
    if (currentFilter === 'favorites' && topics !== undefined) {
      titleContent = <h2><FormattedMessage {...localMessages.topicsListFavorites} /></h2>;
      whichTopics = topics.favorite;
    } else if (currentFilter === 'personal' && topics !== undefined) {
      titleContent = <h2><FormattedMessage {...localMessages.topicsListPersonal} /></h2>;
      whichTopics = topics.personal.topics;
    } else if (currentFilter === 'public' && topics !== undefined) {
      titleContent = <h2><FormattedMessage {...localMessages.topicsListPublic} /></h2>;
      whichTopics = topics.public;
    } else { // when user is not logged in and clicks the other options
      titleContent = <h2><FormattedMessage {...localMessages.noAccess} /></h2>;
    }

    return (
      <div className="topic-list-container">
        <Row>
          <Col lg={2} md={2} sm={12}>
            { titleContent }
          </Col>
          <Col lg={2} md={2} sm={12}>
            <span className="label unlabeled-field-label">
              <FormattedMessage {...localMessages.topicsListFilter} />
            </span>
          </Col>
          <Col lg={7} md={7} sm={12}>
            <SelectField name="currentFilter" style={{ fontSize: 13 }} value={currentFilter}>
              <MenuItem
                value="favorites"
                onClick={() => this.changeFilter('favorites')}
                primaryText={formatMessage(localMessages.topicsListFavorites)}
                style={{ fontSize: 13 }}
              />
              <MenuItem
                value="personal"
                primaryText={formatMessage(localMessages.topicsListPersonal)}
                onClick={() => this.changeFilter('personal')}
                style={{ fontSize: 13 }}
              />
              <MenuItem
                value="public"
                onClick={() => this.changeFilter('public')}
                primaryText={formatMessage(localMessages.topicsListPublic)}
                style={{ fontSize: 13 }}
              />
            </SelectField>
          </Col>

        </Row>

        <TopicList topics={whichTopics} showFavorites={showFavorites} onSetFavorited={onSetFavorited} />
        <Row>
          <Col lg={12} md={12} sm={12}>
            { previousButton }
            { nextButton }
          </Col>
        </Row>
      </div>
    );
  }
}

TopicListContainer.propTypes = {
  // from parent
  onSetFavorited: React.PropTypes.func.isRequired,
  // from state
  topics: React.PropTypes.object.isRequired,
  links: React.PropTypes.object,
  // from context
  intl: React.PropTypes.object.isRequired,
  // from dispatch
  asyncFetch: React.PropTypes.func.isRequired,
  // from PagedContainer wrapper
  nextButton: React.PropTypes.node,
  previousButton: React.PropTypes.node,
  showFavorites: React.PropTypes.bool,
  setFilter: React.PropTypes.func.isRequired,
  currentFilter: React.PropTypes.string,
};

const mapStateToProps = state => ({
  fetchStatus: state.topics.all.fetchStatus,
  topics: state.topics.all.topics,
  links: state.topics.all.link_ids,
  showFavorites: state.topics.all.showFavorites,
  currentFilter: state.topics.all.currentFilter,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  asyncFetch: () => {
    dispatch(fetchTopicsList());
  },
  setFilter: (filter) => {
    dispatch(setTopicListFilter({ currentFilter: filter }));
  },
  fetchPagedData: (props, linkId) => {
    dispatch(fetchTopicsList(props.currentFilter, linkId))
      .then(() => {
        dispatch(push(pagedLocation(ownProps.location, linkId)));
      });
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    nextPage: () => {
      dispatchProps.fetchPagedData(stateProps, stateProps.links.next);
    },
    previousPage: () => {
      dispatchProps.fetchPagedData(stateProps, stateProps.links.previous);
    },
  });
}

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps, mergeProps)(
      composePagedContainer(
        composeAsyncContainer(
          TopicListContainer
        )
      )
    )
  );
