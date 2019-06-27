import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { selectMediaPickerQueryArgs, selectMedia } from '../../../actions/systemActions';
import { PICK_SOURCE_AND_COLLECTION, PICK_FEATURED } from '../../../lib/explorerUtil';
import SourceOrCollectionOrSearchWidget from '../SourceOrCollectionOrSearchWidget';
// import SelectedMediaContainer from './SelectedMediaContainer';

const localMessages = {
  pickSAndC: { id: 'system.mediaPicker.select.pickSources', defaultMessage: 'Search Sources & Collections' },
  selectedMedia: { id: 'system.mediaPicker.selected.title', defaultMessage: 'Selected Media' },
  pickFeatured: { id: 'system.mediaPicker.select.pickFeatured', defaultMessage: 'Browse Featured & Starred' },
};

class PickedMediaContainer extends React.Component {
  updateMediaType = (menuSelection) => {
    const { updateMediaSelection } = this.props;
    updateMediaSelection({ type: menuSelection });
  };

  render() {
    const { selectedMediaQueryType, selectedMedia, handleUnselectMedia } = this.props;
    const options = [
      { label: localMessages.pickFeatured, value: PICK_FEATURED },
      { label: localMessages.pickSAndC, value: PICK_SOURCE_AND_COLLECTION },
    ];
    return (
      <div>
        <div className="select-media-menu">
          {options.map((option, idx) => (
            <a
              key={option.value}
              href="#select"
              onClick={(evt) => {
                evt.preventDefault();
                this.updateMediaType(option.value);
              }}
            >
              <div
                key={idx}
                className={`select-media-option ${(selectedMediaQueryType === option.value) ? 'selected' : ''}`}
              >
                <h3><FormattedMessage {...option.label} /></h3>
              </div>
            </a>
          ))}
        </div>
        <div className="select-media-selected-list">
          <h3><FormattedMessage {...localMessages.selectedMedia} /></h3>
          {selectedMedia.map(obj => (
            <SourceOrCollectionOrSearchWidget
              key={obj.id || obj.tags_id || obj.media_id || obj.tag_sets_id || obj.tags.name}
              object={obj}
              onDelete={() => handleUnselectMedia(obj)}
            />
          ))}
        </div>
      </div>
    );
  }
}

PickedMediaContainer.propTypes = {
  // from context
  intl: PropTypes.object.isRequired,
  // from parent
  selectedMedia: PropTypes.array,
  selectedMediaQueryType: PropTypes.number,
  updateMediaSelection: PropTypes.func.isRequired,
  handleUnselectMedia: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  sourcesResults: state.system.mediaPicker.media ? state.system.mediaPicker.media.results : null, // resutl of query?
  selectedMediaQueryType: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.type : 0,
  collectionsResults: state.system.mediaPicker.collections ? state.system.mediaPicker.collections.results : null,
  favoritedCollections: state.system.mediaPicker.favoritedCollections ? state.system.mediaPicker.favoritedCollections.results : null,
  favoritedSources: state.system.mediaPicker.favoritedSources ? state.system.mediaPicker.favoritedSources.results : null,
});

const mapDispatchToProps = dispatch => ({
  updateMediaSelection: (type) => {
    if (type.type >= 0) {
      dispatch(selectMediaPickerQueryArgs(type));
    }
  },
  handleUnselectMedia: (selectedMedia) => {
    if (selectedMedia) {
      let unselectedMedia = {};
      if (selectedMedia.id) {
        unselectedMedia = Object.assign({}, selectedMedia, { selected: false });
      } else {
        Object.keys(selectedMedia.tags).forEach((m) => { // for each tag
          Object.values(selectedMedia.tags[m]).map(a => Object.assign(a, { selected: false }));
        });
        const unselectedMetadataTags = Object.values(selectedMedia.tags).map(t => (Object.assign({}, t, { selected: false })));
        unselectedMedia.tags = unselectedMetadataTags;
        unselectedMedia.addAllSearch = false;
      }
      dispatch(selectMedia(unselectedMedia)); // TODO: why aren't we using a specific action and reducer to do this?
    }
  },
});


export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    PickedMediaContainer
  )
);
