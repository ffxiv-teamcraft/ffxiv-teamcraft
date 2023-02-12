import { createAction, props } from '@ngrx/store';
import { ListLayout } from '../list-layout';

const PREFIX = '[List Layouts]';

export const loadListLayout = createAction(
  `${PREFIX} Load ListLayout`,
  props<{ key: string }>()
);

export const loadListLayoutSuccess = createAction(
  `${PREFIX} Load ListLayout Success`,
  props<{ layout: ListLayout }>()
);

export const loadListLayouts = createAction(
  `${PREFIX} Load ListLayouts`
);

export const loadListLayoutsSuccess = createAction(
  `${PREFIX} Load ListLayouts Success`,
  props<{ layouts: ListLayout[] }>()
);

export const selectListLayout = createAction(
  `${PREFIX} Select List Layout`,
  props<{ key: string }>()
);

export const createListLayout = createAction(
  `${PREFIX} Create List Layout`,
  props<{ layout: ListLayout }>()
);

export const updateListLayout = createAction(
  `${PREFIX} Update List Layout`,
  props<{ layout: ListLayout }>()
);

export const deleteListLayout = createAction(
  `${PREFIX} Delete List Layout`,
  props<{ id: string }>()
);



