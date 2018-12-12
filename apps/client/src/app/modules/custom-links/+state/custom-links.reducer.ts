import { CustomLink } from '../../../core/database/custom-links/custom-link';
import { CustomLinksAction, CustomLinksActionTypes } from './custom-links.actions';

export const CUSTOM_LINKS_FEATURE_KEY = 'customLinks';

export interface CustomLinksState {
  list: CustomLink[]; // list of CustomLinks; analogous to a sql normalized table
  selectedId?: string | number; // which CustomLink record has been selected
  loaded: boolean; // has the CustomLinks list been loaded
}

export interface CustomLinksPartialState {
  readonly [CUSTOM_LINKS_FEATURE_KEY]: CustomLinksState;
}

export const initialState: CustomLinksState = {
  list: [],
  loaded: false
};

export function customLinksReducer(
  state: CustomLinksState = initialState,
  action: CustomLinksAction
): CustomLinksState {
  switch (action.type) {
    case CustomLinksActionTypes.MyCustomLinksLoaded: {
      state = {
        ...state,
        list: [
          ...state.list.filter(link => link.authorId !== action.userId),
          ...action.payload
        ],
        loaded: true
      };
      break;
    }

    case CustomLinksActionTypes.UpdateCustomLink: {
      state = {
        ...state,
        list: [
          ...state.list.map(link => {
            if (link.authorId === action.link.$key) {
              return action.link;
            }
            return link;
          })
        ],
        loaded: true
      };
      break;
    }

    case CustomLinksActionTypes.CreateCustomLink: {
      state = {
        ...state,
        list: [
          ...state.list,
          action.link
        ]
      };
      break;
    }

    case CustomLinksActionTypes.SelectCustomLink: {
      state = {
        ...state,
        selectedId: action.key
      };
      break;
    }

    case CustomLinksActionTypes.CustomLinkLoaded: {
      state = {
        ...state,
        list: [
          ...state.list.filter(link => link.$key !== action.link.$key),
          action.link
        ]
      };
      break;
    }

    case CustomLinksActionTypes.DeleteCustomLink: {
      state = {
        ...state,
        list: [
          ...state.list.filter(link => link.$key !== action.key)
        ]
      };
      break;
    }
  }
  return state;
}
