import { createIndexedAsyncReducer } from '../../lib/reduxHelpers';
import { FETCH_QUERY_SPLIT_STORY_COUNT, RESET_STORY_SPLIT_COUNTS, SELECT_DATA_POINT, SELECT_EXPLORER_TIME_AGGREGATE,
  RESET_SELECTED_DATA_POINT } from '../../actions/explorerActions';
import { cleanDateCounts, PAST_DAY } from '../../lib/dateUtil';

const storySplitCount = createIndexedAsyncReducer({
  initialState: ({
    counts: [],
    selectedTimePeriod: PAST_DAY,
  }),
  action: FETCH_QUERY_SPLIT_STORY_COUNT,
  handleSuccess: payload => ({
    counts: cleanDateCounts(payload.results.counts),
    total: payload.results.total,
    normalizedTotal: payload.results.normalized_total,
    ratio: payload.results.total / payload.results.normalized_total,
  }),
  [SELECT_DATA_POINT]: payload => ({
    dataPoint: payload,
  }),
  [RESET_SELECTED_DATA_POINT]: () => ({
    dataPoint: null,
  }),
  [RESET_STORY_SPLIT_COUNTS]: () => ({
    fetchStatus: '', fetchStatuses: [], results: [], dateRangeSpread: 0, dataPoint: null,
  }),
  [SELECT_EXPLORER_TIME_AGGREGATE]: payload => ({
    selectedTimePeriod: payload,
  }),
});

export default storySplitCount;
