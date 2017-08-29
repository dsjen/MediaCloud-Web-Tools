import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import * as d3 from 'd3';
import messages from '../../../resources/messages';
import QueryForm from './QueryForm';
import AppButton from '../../common/AppButton';
import ItemSlider from '../../common/ItemSlider';
import QueryPickerItem from './QueryPickerItem';
import { selectQuery, updateQuery, addCustomQuery, saveQuerySet, deleteQuery } from '../../../actions/explorerActions';
import { AddQueryButton } from '../../common/IconButton';
import { getPastTwoWeeksDateRange } from '../../../lib/dateUtil';
import { DEFAULT_COLLECTION_OBJECT_ARRAY } from '../../../lib/explorerUtil';
import { getUserRoles, hasPermissions, PERMISSION_LOGGED_IN } from '../../../lib/auth';

const localMessages = {
  mainTitle: { id: 'explorer.querypicker.mainTitle', defaultMessage: 'Query List' },
  intro: { id: 'explorer.querypicker.intro', defaultMessage: 'Here are all available queries' },
  addQuery: { id: 'explorer.querypicker.addQuery', defaultMessage: 'Add query' },
  querySearch: { id: 'explorer.queryBuilder.advanced', defaultMessage: 'Search' },
  searchHint: { id: 'explorer.queryBuilder.hint', defaultMessage: 'Search' },
};

const MAX_COLORS = 20;

class QueryPicker extends React.Component {

  addAQuery(newQueryObj) {
    const { addAQuery } = this.props;
    addAQuery(newQueryObj);
  }

  // called by query picker to update things like label or color
  updateQueryProperty(query, propertyName, newValue) {
    const { updateCurrentQuery } = this.props;
    const updatedQuery = { ...query };
    updatedQuery[propertyName] = newValue;
    // now update it in the store
    updateCurrentQuery(updatedQuery);
  }

  updateQuery(newInfo) {
    const { updateCurrentQuery, selected } = this.props;
    const updateObject = selected;
    if (newInfo.length) { // assume it's an array
      newInfo.forEach((obj) => {
        if (obj.type === 'source') {
          if (!updateObject.sources.some(s => parseInt(s.id, 10) === parseInt(obj.id, 10))) {
            updateObject.sources.push(obj);
          }
        } else if (obj.type === 'collection') {
          if (!updateObject.collections.some(s => parseInt(s.id, 10) === parseInt(obj.id, 10))) {
            updateObject.collections.push(obj);
          }
        }
      });
    } else {
      const fieldName = newInfo.target ? newInfo.target.name : newInfo.name;
      const fieldValue = newInfo.target ? newInfo.target.value : newInfo.value;
      updateObject[fieldName] = fieldValue;
      // TODO check the logic of this. if demo mode and the user changes the q, label should be equivalent?
      if (fieldName === 'q') {
        updateObject.label = fieldValue;
      }
    }
    updateCurrentQuery(updateObject);
  }

  handleSaveQuerySet() {
    const { selected, saveThisQuerySet } = this.props;
    saveThisQuerySet(selected);
  }
  handleOpenStub() {
    return this.props;
  }
  isDeletable() {
    const { queries } = this.props;
    return queries.length >= 2; // because we always have an empty query in the query array
  }
  handleDeleteAndSelectQuery(query) {
    const { queries, handleDeleteQuery } = this.props;
    const queryIndex = queries.findIndex(q => q.index !== null && q.index === query.index);
    const replaceSelectionWithWhichQuery = queryIndex === 0 ? 1 : 0; // replace with the query, not the position
    if (this.isDeletable()) {
      handleDeleteQuery(query, queries[replaceSelectionWithWhichQuery]);
    }
  }

  render() {
    const { selected, queries, user, collectionsResults, sourcesResults, handleQuerySelected, isEditable, handleSearch } = this.props;
    const { formatMessage } = this.props.intl;
    let queryPickerContent; // editable if demo mode
    let queryFormContent; // hidden if demo mode
    let fixedQuerySlides;
    let canSelectMedia = false;
    const userLoggedIn = hasPermissions(getUserRoles(user), PERMISSION_LOGGED_IN);

    const unDeletedQueries = queries.filter(q => !q.deleted);
    if (unDeletedQueries && unDeletedQueries.length > 0 && selected &&
      collectionsResults && collectionsResults.length > 0 &&
      sourcesResults && sourcesResults.length >= 0) {
      fixedQuerySlides = unDeletedQueries.map((query, index) => (
        <div key={index}>
          <QueryPickerItem
            user={user}
            key={index}
            query={query}
            isSelected={selected.index === index}
            isEditable={isEditable} // if custom, true for either mode, else if logged in no
            isDeletable={() => this.isDeletable()}
            displayLabel={false}
            onQuerySelected={() => handleQuerySelected(query, index)}
            updateQueryProperty={(propertyName, newValue) => this.updateQueryProperty(query, propertyName, newValue)}
            handleSearch={handleSearch}
            handleDeleteQuery={() => this.handleDeleteAndSelectQuery(query)}
            // loadDialog={loadQueryEditDialog}
          />
        </div>
      ));
      canSelectMedia = userLoggedIn;
      // provide the add Query button, load with default values when Added is clicked
      if (isEditable) {
        const colorPallette = idx => d3.schemeCategory20[idx < MAX_COLORS ? idx : 0];
        const dateObj = getPastTwoWeeksDateRange();
        const newIndex = queries.length; // NOTE: all queries, including 'deleted' ones
        const genDefColor = colorPallette(newIndex);
        const defaultQuery = { index: newIndex, label: 'enter query', q: '', description: 'new', startDate: dateObj.start, endDate: dateObj.end, collections: DEFAULT_COLLECTION_OBJECT_ARRAY, sources: [], color: genDefColor, custom: true };

        const emptyQuerySlide = (
          <div key={fixedQuerySlides.length}>
            <div className="query-picker-item">
              <div className="add-query-item">
                <AddQueryButton
                  key={fixedQuerySlides.length} // this isn't working
                  tooltip={formatMessage(localMessages.addQuery)}
                  onClick={() => this.addAQuery(defaultQuery)}
                />
                <FormattedMessage {...localMessages.addQuery} />
              </div>
            </div>
          </div>
        );

        fixedQuerySlides.push(emptyQuerySlide);
      }
      let demoSearchButtonContent; // in demo mode we need a search button outside the form (cause we can't see the form)
      if (!userLoggedIn) {
        demoSearchButtonContent = (
          <Grid>
            <Row>
              <Col lg={10} />
              <Col lg={1}>
                <AppButton
                  style={{ marginTop: 30 }}
                  type="submit"
                  label={formatMessage(messages.search)}
                  primary
                  onTouchTap={handleSearch}
                />
              </Col>
            </Row>
          </Grid>
        );
      }
      queryPickerContent = (
        <div className="query-picker-wrapper">
          <div className="query-picker">
            <Grid>
              <ItemSlider
                title={formatMessage(localMessages.intro)}
                slides={fixedQuerySlides}
                settings={{ height: 60, dots: false, slidesToShow: 4, slidesToScroll: 1, infinite: false, arrows: fixedQuerySlides.length > 4 }}
              />
            </Grid>
          </div>
          {demoSearchButtonContent}
        </div>
      );
      if (userLoggedIn) {  // if logged in show full form
        queryFormContent = (
          <QueryForm
            initialValues={selected}
            selected={selected}
            form="queryForm"
            enableReinitialize
            destroyOnUnmount={false}
            buttonLabel={formatMessage(localMessages.querySearch)}
            onSave={handleSearch}
            onChange={event => this.updateQuery(event)}
            handleOpenHelp={this.handleOpenStub}
            handleSaveQuerySet={q => this.handleSaveQuerySet(q)}
            isEditable={canSelectMedia}
          />
        );
      }
      // indicate which queryPickerItem is selected -
      // const selectedWithSandCLabels = queries.find(q => q.index === selected.index);
      return (
        <div>
          {queryPickerContent}
          {queryFormContent}
        </div>
      );
    }
    return ('error - no queries ');
  }
}

QueryPicker.propTypes = {
  user: React.PropTypes.object.isRequired,
  queries: React.PropTypes.array,
  sourcesResults: React.PropTypes.array,
  collectionsResults: React.PropTypes.array,
  fetchStatus: React.PropTypes.string.isRequired,
  selected: React.PropTypes.object,
  intl: React.PropTypes.object.isRequired,
  handleQuerySelected: React.PropTypes.func.isRequired,
  isEditable: React.PropTypes.bool.isRequired,
  isDeletable: React.PropTypes.func,
  handleSearch: React.PropTypes.func.isRequired,
  updateCurrentQuery: React.PropTypes.func.isRequired,
  handleDeleteAndSelectQuery: React.PropTypes.func,
  handleDeleteQuery: React.PropTypes.func.isRequired,
  saveThisQuerySet: React.PropTypes.func.isRequired,
  addAQuery: React.PropTypes.func.isRequired,
  handleOpenStub: React.PropTypes.func,
};

const mapStateToProps = state => ({
  selected: state.explorer.selected,
  queries: state.explorer.queries.queries,
  sourcesResults: state.explorer.queries.sources.results ? state.explorer.queries.sources.results : null,
  collectionsResults: state.explorer.queries.collections.results ? state.explorer.queries.collections.results : null,
  fetchStatus: state.explorer.queries.collections.fetchStatus,
  user: state.user,
  // formData: formSelector(state, 'q', 'start_date', 'end_date', 'color'),
});


const mapDispatchToProps = (dispatch, ownProps) => ({
  handleQuerySelected: (query, index) => {
    const queryWithIndex = Object.assign({}, query, { index });
    dispatch(selectQuery(queryWithIndex));
  },
  updateCurrentQuery: (query) => {
    if (query) {
      dispatch(updateQuery(query));
    } else {
      dispatch(updateQuery(ownProps.selected)); // this won't e right
    }
  },
  addAQuery: (query) => {
    if (query) {
      dispatch(addCustomQuery(query));
      dispatch(selectQuery(query));
    }
  },
  saveThisQuerySet: (query) => {
    if (query) { // TODO - save as JSON
      dispatch(saveQuerySet({ label: query.label, query_string: query.q }));
    }
  },
  handleDeleteQuery: (query, replacementSelectionQuery) => {
    if (query) {
      dispatch(deleteQuery(query)); // will change queries, but not URL, this is the problem
      dispatch(selectQuery(replacementSelectionQuery));
    }
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      QueryPicker
    )
  );

