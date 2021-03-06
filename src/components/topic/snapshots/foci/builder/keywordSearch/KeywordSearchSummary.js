import PropTypes from 'prop-types';
import React from 'react';
import { FormattedHTMLMessage, injectIntl } from 'react-intl';
import { NEW_FOCAL_SET_PLACEHOLDER_ID } from '../FocusDescriptionForm';

const localMessages = {
  focalSetNew: { id: 'focus.create.confirm.focalSetNew', defaultMessage: '<b>Technique</b>: Create a new one named {name} ({description}' },
  focalSetExisting: { id: 'focus.create.confirm.focalSetExisting', defaultMessage: '<b>Technique</b>: Add to existing' },
  name: { id: 'focus.create.confirm.name', defaultMessage: '<b>Name</b>: {name}' },
  description: { id: 'focus.create.confirm.description', defaultMessage: '<b>Description</b>: {description}' },
  keywords: { id: 'focus.create.confirm.booleanQuery.keywords', defaultMessage: '<b>Keywords</b>: {keywords}' },
};

const KeywordSearchSummary = (props) => {
  const { formValues } = props;
  let focalSetContent = null;
  switch (formValues.focalSetDefinitionId) {
    case NEW_FOCAL_SET_PLACEHOLDER_ID:
      focalSetContent = <FormattedHTMLMessage {...localMessages.focalSetNew} values={{ name: formValues.focalSetName, description: formValues.focalSetDescription }} />;
      break;
    default:
      focalSetContent = <FormattedHTMLMessage {...localMessages.focalSetExisting} />;
  }
  return (
    <div className="focus-create-cofirm-boolean-query">
      <ul>
        <li><FormattedHTMLMessage {...localMessages.name} values={{ name: formValues.focusName }} /></li>
        <li><FormattedHTMLMessage {...localMessages.description} values={{ description: formValues.focusDescription }} /></li>
        <li>{focalSetContent}</li>
        <li><FormattedHTMLMessage {...localMessages.keywords} values={{ keywords: formValues.keywords }} /></li>
      </ul>
    </div>
  );
};

KeywordSearchSummary.propTypes = {
  // from parent
  topicId: PropTypes.number.isRequired,
  formValues: PropTypes.object.isRequired,
  // form context
  intl: PropTypes.object.isRequired,
};

export default injectIntl(KeywordSearchSummary);
