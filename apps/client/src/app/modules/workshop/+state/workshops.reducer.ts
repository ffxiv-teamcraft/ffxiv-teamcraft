import { WorkshopsAction, WorkshopsActionTypes } from './workshops.actions';
import { Workshop } from '../../../model/other/workshop';

/**
 * Interface for the 'Workshops' data used in
 *  - WorkshopsState, and
 *  - workshopsReducer
 *
 *  Note: replace if already defined in another module
 */

export interface WorkshopsState {
  workshops: Workshop[];
  selectedId?: string; // which Workshop record has been selected
  workshopsConnected: boolean;
}

export const initialState: WorkshopsState = {
  workshops: [],
  workshopsConnected: false
};

export function workshopsReducer(
  state: WorkshopsState = initialState,
  action: WorkshopsAction
): WorkshopsState {
  switch (action.type) {
    case WorkshopsActionTypes.MyWorkshopsLoaded: {
      state = {
        ...state,
        workshops: [
          ...state.workshops.filter(workshop => action.payload.find(w => w.$key === workshop.$key) === undefined),
          ...action.payload
        ],
        workshopsConnected: true
      };
      break;
    }

    case WorkshopsActionTypes.SharedWorkshopsLoaded: {
      state = {
        ...state,
        workshops: [
          ...state.workshops.filter(workshop => action.payload.find(w => w.$key === workshop.$key) === undefined),
          ...action.payload
        ]
      };
      break;
    }

    case WorkshopsActionTypes.WorkshopLoaded: {
      state = {
        ...state,
        workshops: [
          ...state.workshops.filter(workshop => action.workshop.$key !== workshop.$key),
          <Workshop>action.workshop
        ],
        workshopsConnected: true
      };
      break;
    }

    case WorkshopsActionTypes.DeleteWorkshop: {
      state = {
        ...state,
        workshops: [
          ...state.workshops.filter(workshop => workshop.$key !== action.key)
        ]
      };
      break;
    }

    case WorkshopsActionTypes.SelectWorkshop: {
      state = {
        ...state,
        selectedId: action.key
      };
    }
  }
  return state;
}
