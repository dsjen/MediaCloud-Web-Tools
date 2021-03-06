import { createAsyncReducer } from '../../../../lib/reduxHelpers';
import { FETCH_SOURCE_GEO } from '../../../../actions/sourceActions';


const geoTag = createAsyncReducer({
  initialState: {
    total: null,
    list: [],
  },
  action: FETCH_SOURCE_GEO,
  handleFetch: () => ({ list: [], total: null }),
  handleSuccess: payload => ({
    total: payload.results.geography.total,
    list: payload.results.geography,
  }),
  handleFailure: () => ({ list: [], total: null }),
});
export default geoTag;
