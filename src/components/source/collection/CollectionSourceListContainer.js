import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import composeAsyncContainer from '../../common/AsyncContainer';
import { fetchCollectionSourceList } from '../../../actions/sourceActions';
import SourceList from '../../common/SourceList';
import { getUserRoles, hasPermissions, PERMISSION_MEDIA_EDIT } from '../../../lib/auth';

const CollectionSourceListContainer = props => (
  <SourceList
    collectionId={props.collectionId}
    sources={props.sources}
    downloadUrl={`/api/collections/${props.collectionId}/sources.csv`}
  />
);

CollectionSourceListContainer.propTypes = {
  // parent
  collectionId: PropTypes.number,
  downloadUrl: PropTypes.string,
  // from store
  sources: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.sources.collections.selected.collectionSourceList.fetchStatus,
  sources: state.sources.collections.selected.collectionSourceList.sources,
  user: state.user,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchData: (collectionId, props) => {
    dispatch(fetchCollectionSourceList(ownProps.collectionId, props));
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    asyncFetch: () => {
      const props = {};
      // if it is an admin user, fetch the source list with extra details so they are there for the manage sources screen
      if (hasPermissions(getUserRoles(stateProps.user), PERMISSION_MEDIA_EDIT)) {
        props.details = true;
      }
      dispatchProps.fetchData(ownProps.collectionId, props);
    },
  });
}

export default
  connect(mapStateToProps, mapDispatchToProps, mergeProps)(
    composeAsyncContainer(
      CollectionSourceListContainer
    )
  );