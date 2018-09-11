import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import PermissionForm from './PermissionForm';
import { fetchPermissionsList, updatePermission } from '../../../actions/topicActions';
import withAsyncFetch from '../../common/hocs/AsyncContainer';
import BackLinkingControlBar from '../BackLinkingControlBar';
import { updateFeedback } from '../../../actions/appActions';
import { PERMISSION_TOPIC_NONE } from '../../../lib/auth';
import messages from '../../../resources/messages';

const localMessages = {
  title: { id: 'topic.permissions.title', defaultMessage: 'Topic Permissions' },
  intro: { id: 'topic.permissions.intro', defaultMessage: 'You can control who is allowed to see, and who is allowed to edit, this Topic. Enter another user\'s email in the field below, set whether they can read or edit the topic, and then click add. Read permission allows the given user to view all data within the topic. Write permission grants read permission and also allows the user to perform all operations on the topic -- including spidering, snapshotting, and merging — other editing permissions. Admin permission grants write permission and also allows all the user to edit the permissions for the topic.' },
  existingTitle: { id: 'topic.permissions.existing.title', defaultMessage: 'Current Permissions' },
  existingIntro: { id: 'topic.permissions.existing.intro', defaultMessage: 'Here is a list of the current users and what they are allowed to do.' },
  addTitle: { id: 'topic.permissions.add', defaultMessage: 'Add Someone to this Topic' },
  invalidEmail: { id: 'topic.permissions.email.invalid', defaultMessage: '⚠️ We don\'t recognize that email!' },
};

class TopicPermissionsContainer extends React.Component {
  componentWillReceiveProps(nextProps) {
    const { topicId, fetchData } = this.props;
    if ((nextProps.topicId !== topicId)) {
      fetchData(nextProps.topicId);
    }
  }

  render() {
    const { handleUpdate, permissions, topicId, handleSubmit, handleDelete } = this.props;
    const permissionsPlusOne = [{ email: '', permission: '' }, ...permissions];
    return (
      <div className="topic-permissioned">
        <BackLinkingControlBar message={messages.backToTopic} linkTo={`/topics/${topicId}/summary`} />
        <form name="updatePermissionFormParent" onSubmit={handleSubmit} onDelete={handleDelete}>
          <div className="topic-acl">
            <Grid>
              <Row>
                <Col lg={12} md={12} sm={12}>
                  <h1><FormattedMessage {...localMessages.title} /></h1>
                  <p><FormattedMessage {...localMessages.intro} /></p>
                </Col>
              </Row>
              <Row>
                <Col lg={12} md={12} sm={12}>
                  <h2><FormattedMessage {...localMessages.addTitle} /></h2>
                </Col>
              </Row>
              <PermissionForm index="0" initialValues={permissionsPlusOne} onSave={handleUpdate} />
              <Row>
                <Col md={10} sm={12}>
                  <h2><FormattedMessage {...localMessages.existingTitle} /></h2>
                  <p><FormattedMessage {...localMessages.existingIntro} /></p>
                </Col>
              </Row>
              { permissions.map((p, index) => (
                <PermissionForm
                  index={`${index + 1}`}
                  key={p.email}
                  onSave={handleUpdate}
                  initialValues={permissionsPlusOne} // b/c of how this is constructed - we need each form to have all the permission data
                  showDeleteButton
                  onDelete={handleDelete}
                />
              ))}
            </Grid>
          </div>
        </form>
      </div>
    );
  }
}

TopicPermissionsContainer.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  // from dispatch
  handleUpdate: PropTypes.func.isRequired,
  fetchData: PropTypes.func.isRequired,
  asyncFetch: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  // from state
  topicId: PropTypes.number,
  fetchStatus: PropTypes.string.isRequired,
  permissions: PropTypes.array,
  // from form helper
  initialValues: PropTypes.object,
  handleSubmit: PropTypes.func,
};

const mapStateToProps = state => ({
  topicId: state.topics.selected.id,
  fetchStatus: state.topics.selected.permissions.fetchStatus,
  permissions: state.topics.selected.permissions.list,
  formValues: state.form.updatePermissionFormParent,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  doUpdatePermission: (topicId, values) => {
    // save and then update the list of existing permissions
    dispatch(updatePermission(topicId, values.email, values.permission))
      .then((response) => {
        if (response.success === 0) {
          dispatch(updateFeedback({
            open: true,
            message: ownProps.intl.formatMessage(localMessages.invalidEmail),
          }));
        } else {
          dispatch(fetchPermissionsList(topicId));
        }
      });
  },
  doDeletePermission: (topicId, values) => {
    dispatch(updatePermission(topicId, values.email, PERMISSION_TOPIC_NONE))
      .then(() => dispatch(fetchPermissionsList(topicId)));
  },
  fetchData: (topicId) => {
    dispatch(fetchPermissionsList(topicId));
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    handleUpdate: (index) => {
      dispatchProps.doUpdatePermission(stateProps.topicId, stateProps.formValues.values[index]);
    },
    handleDelete: (index) => {
      dispatchProps.doDeletePermission(stateProps.topicId, stateProps.formValues.values[index]);
    },
    asyncFetch: () => {
      dispatchProps.fetchData(stateProps.topicId);
    },
  });
}
const reduxFormConfig = {
  form: 'updatePermissionFormParent',
  enableReinitialize: true,
  // validate,
  destroyOnUnmount: false,
};

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps, mergeProps)(
    withAsyncFetch(
      reduxForm(reduxFormConfig)(
        TopicPermissionsContainer
      )
    )
  )
);
