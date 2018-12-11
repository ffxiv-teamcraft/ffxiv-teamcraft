import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  CUSTOM_LINKS_FEATURE_KEY,
  CustomLinksState
} from './custom-links.reducer';

// Lookup the 'CustomLinks' feature state managed by NgRx
const getCustomLinksState = createFeatureSelector<CustomLinksState>(
  CUSTOM_LINKS_FEATURE_KEY
);

const getLoaded = createSelector(
  getCustomLinksState,
  (state: CustomLinksState) => state.loaded
);

const getAllCustomLinks = createSelector(
  getCustomLinksState,
  (state: CustomLinksState) => {
    return state.list;
  }
);
const getSelectedId = createSelector(
  getCustomLinksState,
  (state: CustomLinksState) => state.selectedId
);
const getSelectedCustomLink = createSelector(
  getAllCustomLinks,
  getSelectedId,
  (customLinks, id) => {
    return customLinks.find(it => it.$key === id);
  }
);

export const customLinksQuery = {
  getLoaded,
  getAllCustomLinks,
  getSelectedCustomLink
};
