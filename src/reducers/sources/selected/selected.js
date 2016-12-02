import { combineReducers } from 'redux';
import { SELECT } from '../../../actions/sourceActions';
import details from './details/details';
import sourceInfo from './sourceInfo';
import collectionInfo from './collectionInfo';
import sourcesByMetadata from './sourcesByMetadata';
import collectionsByMetadata from './collectionsByMetadata';

const INITIAL_STATE = null;

function id(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SELECT:
      return parseInt(action.payload.id, 10);
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  id,
  sourceInfo,
  collectionInfo,
  details,
  sourcesByMetadata,
  collectionsByMetadata,
});

export default rootReducer;
