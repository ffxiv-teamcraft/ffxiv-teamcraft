import { RotationsAction, RotationsActionTypes } from './rotations.actions';
import { CraftingRotation } from '../../../model/other/crafting-rotation';

export interface RotationsState {
  rotations: CraftingRotation[]; // list of Rotations; analogous to a sql normalized table
  selectedId?: string; // which Rotations record has been selected
  loaded: boolean; // has the Rotations list been loaded
}

export const initialState: RotationsState = {
  rotations: [],
  loaded: false
};

export function rotationsReducer(
  state: RotationsState = initialState,
  action: RotationsAction
): RotationsState {
  switch (action.type) {
    case RotationsActionTypes.MyRotationsLoaded: {
      state = {
        ...state,
        rotations: [
          ...state.rotations.filter(rotation => rotation.authorId !== action.userId),
          ...action.payload
        ],
        loaded: true
      };
      break;
    }

    case RotationsActionTypes.CreateRotation: {
      state = {
        ...state,
        rotations: [...state.rotations.filter(rotation => rotation.$key !== undefined), action.rotation]
      };
      break;
    }

    case RotationsActionTypes.RotationLoaded: {
      state = {
        ...state,
        rotations: [...state.rotations.filter(r => r.$key !== action.rotation.$key), <CraftingRotation>action.rotation]
      };
      break;
    }

    case RotationsActionTypes.DeleteRotation: {
      state = {
        ...state,
        rotations: [...state.rotations.filter(rotation => rotation.$key !== action.key)]
      };
      break;
    }

    case RotationsActionTypes.SelectRotation: {
      state = {
        ...state,
        selectedId: action.key
      };
      break;
    }
  }
  return state;
}
