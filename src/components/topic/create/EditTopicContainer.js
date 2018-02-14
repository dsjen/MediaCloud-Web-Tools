import PropTypes from 'prop-types';
import React from 'react';
import { push } from 'react-router-redux';
import Title from 'react-title-component';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { reduxForm } from 'redux-form';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import Dialog from 'material-ui/Dialog';
import { filteredLinkTo } from '../../util/location';
import AppButton from '../../common/AppButton';
import composeIntlForm from '../../common/IntlForm';
import messages from '../../../resources/messages';
import { updateTopic, setTopicNeedsNewSnapshot } from '../../../actions/topicActions';
import { updateFeedback } from '../../../actions/appActions';
import BackLinkingControlBar from '../BackLinkingControlBar';
import Permissioned from '../../common/Permissioned';
import { PERMISSION_TOPIC_WRITE } from '../../../lib/auth';
import TopicForm, { TOPIC_FORM_MODE_EDIT } from './TopicForm';

const localMessages = {
  editTopicTitle: { id: 'topic.edit.title', defaultMessage: 'Edit Topic Settings' },
  editTopicText: { id: 'topic.edit.text', defaultMessage: 'You can update this Topic. If you make changes to the query, media sourcs, or dates, those will be reflected in the next snapshot you run.' },
  editTopic: { id: 'topic.edit', defaultMessage: 'Edit Topic' },
  editTopicCollectionsTitle: { id: 'topic.edit.editTopicCollectionsTitle', defaultMessage: 'Edit Sources and Collections' },
  editTopicCollectionsIntro: { id: 'topic.edit.editTopicCollectionsIntro', defaultMessage: 'The following are the Sources and Collections associated with this topic.' },
  feedback: { id: 'topic.edit.save.feedback', defaultMessage: 'We saved your changes' },
  failed: { id: 'topic.edit.save.failed', defaultMessage: 'Sorry, that didn\'t work!' },
  editRisk: { id: 'topic.edit.save.risk', defaultMessage: 'You have modified this topic and if you proceed you may corrupt your topic!' },
  riskConfirmTitle: { id: 'topic.edit.save.riskConfirmTitle', defaultMessage: 'Warning! Be Careful' },
  handleRiskDescription: { id: 'topic.edit.save.handleRiskDescription', defaultMessage: 'Narrowing these topic settings (date range, seed query and/or media) requires you to re-spider, but previous stories that matched them will NOT be removed. This means your topic will be a confusing combination of what you have now and what you want to have. Only confirm if you know what you are doing.' },
  // editRisk: { id: 'topic.edit.save.risk', defaultMessage: 'You have modified this topic and if you proceed you may corrupt your topic!' },
};

class EditTopicContainer extends React.Component {
  state = {
    editConfirmationOpen: false,
  }
  handleCancelSave = () => {
    this.setState({ editConfirmationOpen: false });
  };
  handleConfirmSave = () => {
    const { formData, topicInfo, handleSave } = this.props;
    this.setState({ editConfirmationOpen: false });
    handleSave(formData.values, topicInfo);
  };
  handleRequestSave = (values) => {
    const { topicInfo, handleSave } = this.props;
    if (this.riskModifiedTopicSpidering(values)) {
      this.setState({ editConfirmationOpen: true });
    } else {
      handleSave(values, topicInfo);
    }
  };
  riskModifiedTopicSpidering = (values) => {
    const { formData } = this.props;
    const modifiedFields = Object.keys(values).filter((f) => {
      if (f === 'solr_seed_query') { // if modified seed query
        return values[f] !== formData.initial[f];
      } else if (f === 'start_date') {
        return values[f] > formData.initial[f]; // if more restrictive dates
      } else if (f === 'end_date') {
        return values[f] < formData.initial[f];
      } else if (f === 'sourcesAndCollections') { // if more restrictive sources
        return values[f].length < formData.initial[f].length;
      }
      return false;
    // evalueate further here but for now return true for a dialog info
    });
    if (modifiedFields.length !== undefined && modifiedFields.length > 0) {
      return true;
    }
    return false;
  };
  render() {
    const { topicInfo, topicId, handleMediaChange, handleMediaDelete } = this.props;
    const { formatMessage } = this.props.intl;
    let initialValues = {};
    let dialogContent = null;
    if (topicInfo) {
      // load sources and collections in a backwards compatible way
      const sources = topicInfo.media ? topicInfo.media.map(t => ({ ...t })) : [];
      const collections = topicInfo.media_tags ? topicInfo.media_tags.map(t => ({ ...t, name: t.label })) : [];
      const sourcesAndCollections = sources.concat(collections);
      initialValues = {
        buttonLabel: formatMessage(messages.save),
        ...topicInfo,
        sourcesAndCollections,
      };
    }
    if (this.state.editConfirmationOpen) {
      const dialogActions = [
        <AppButton
          label={formatMessage(messages.cancel)}
          primary
          onTouchTap={this.handleCancelSave}
        />,
        <AppButton
          label={formatMessage(messages.confirm)}
          primary
          onTouchTap={this.handleConfirmSave}
        />,
      ];
      dialogContent = (
        <Dialog
          title={formatMessage(localMessages.riskConfirmTitle)}
          actions={dialogActions}
          modal
          open={this.state.editConfirmationOpen}
          onRequestClose={this.handleConfirmCancel}
          className="app-dialog"
        >
          <p><FormattedMessage {...localMessages.handleRiskDescription} /></p>
        </Dialog>
      );
    }
    return (
      <div className="topic-edit-form">
        <BackLinkingControlBar message={messages.backToTopic} linkTo={`/topics/${topicId}/summary`} />
        <Grid>
          <Title render={formatMessage(localMessages.editTopicTitle)} />
          <Row>
            <Col lg={12}>
              <h1><FormattedMessage {...localMessages.editTopicTitle} /></h1>
              <p><FormattedMessage {...localMessages.editTopicText} /></p>
            </Col>
          </Row>
          {dialogContent}
          <Permissioned onlyTopic={PERMISSION_TOPIC_WRITE}>
            <TopicForm
              topicId={topicId}
              initialValues={initialValues}
              onSubmit={this.handleRequestSave}
              title={formatMessage(localMessages.editTopicCollectionsTitle)}
              intro={formatMessage(localMessages.editTopicCollectionsIntro)}
              mode={TOPIC_FORM_MODE_EDIT}
              enabledReinitialize
              keepDirtyOnReinitialize
              onMediaChange={handleMediaChange}
              onMediaDelete={handleMediaDelete}
              destroyOnUnmount
            />
          </Permissioned>
        </Grid>
      </div>
    );
  }
}

EditTopicContainer.propTypes = {
  // from context
  location: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  params: PropTypes.object,
  // from state
  timespan: PropTypes.object,
  filters: PropTypes.object.isRequired,
  topicId: PropTypes.number,
  topicInfo: PropTypes.object,
  formData: PropTypes.object,
  // from dispatch/merge
  handleSave: PropTypes.func.isRequired,
  reallyHandleSave: PropTypes.func.isRequired,
  handleMediaChange: PropTypes.func.isRequired,
  handleMediaDelete: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  filters: state.topics.selected.filters,
  topicId: parseInt(ownProps.params.topicId, 10),
  topicInfo: state.topics.selected.info,
  timespan: state.topics.selected.timespans.selected,
  snapshots: state.topics.selected.snapshots.list,
  user: state.user,
  formData: state.form.topicForm,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  reallyHandleSave: (values, topicInfo, filters) => {
    const infoToSave = { ...values };   // clone it so we can edit as needed
    infoToSave.is_public = infoToSave.is_public ? 1 : 0;
    infoToSave.is_logogram = infoToSave.is_logogram ? 1 : 0;
    infoToSave.ch_monitor_id = values.ch_monitor_id === undefined ? '' : values.ch_monitor_id;
    if ('sourcesAndCollections' in values) {
      infoToSave['sources[]'] = values.sourcesAndCollections.filter(s => s.media_id).map(s => s.media_id);
      infoToSave['collections[]'] = values.sourcesAndCollections.filter(s => s.tags_id).map(s => s.tags_id);
    } else {
      infoToSave['sources[]'] = '';
      infoToSave['collections[]'] = '';
    }
    return dispatch(updateTopic(ownProps.params.topicId, infoToSave))
      .then((results) => {
        if (results.topics_id) {
          // let them know it worked
          dispatch(updateFeedback({ open: true, message: ownProps.intl.formatMessage(localMessages.feedback) }));
          // if the dates changed tell them it needs a new snapshot
          if ((infoToSave.start_date !== topicInfo.start_date) || (infoToSave.end_date !== topicInfo.end_date)) {
            dispatch(setTopicNeedsNewSnapshot(true));
          }
          const topicSummaryUrl = filteredLinkTo(`/topics/${results.topics_id}/summary`, filters);
          dispatch(push(topicSummaryUrl));
          // update topic info and redirect back to topic summary
        } else {
          dispatch(updateFeedback({ open: true, message: ownProps.intl.formatMessage(localMessages.failed) }));
        }
      }
    );
  },
  handleMediaDelete: (toBeDeletedObj) => {
    // the user has removed media from the form
    const updatedSources = toBeDeletedObj.filter(m => m.type === 'source' || m.media_id);
    const updatedCollections = toBeDeletedObj.filter(m => m.type === 'collection' || m.tags_id);
    const selectedMedia = updatedCollections.concat(updatedSources);

    ownProps.change('sourcesAndCollections', selectedMedia); // redux-form change action
  },
  handleMediaChange: (sourceAndCollections) => {
    // take selections from mediaPicker and push them back into topicForm
    const updatedSources = sourceAndCollections.filter(m => m.type === 'source' || m.media_id);
    const updatedCollections = sourceAndCollections.filter(m => m.type === 'collection' || m.tags_id);
    const selectedMedia = updatedCollections.concat(updatedSources);

    ownProps.change('sourcesAndCollections', selectedMedia); // redux-form change action
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    handleSave: (values, topicInfo) => dispatchProps.reallyHandleSave(values, topicInfo, stateProps.filters),
  });
}

const reduxFormConfig = {
  form: 'topicForm',
  destroyOnUnmount: false,  // so the wizard works
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
};

export default
  composeIntlForm(
    reduxForm(reduxFormConfig)(
      connect(mapStateToProps, mapDispatchToProps, mergeProps)(
        EditTopicContainer
      )
    )
  );
