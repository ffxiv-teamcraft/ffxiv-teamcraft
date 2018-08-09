import {AuthActions, AuthActionTypes} from '../actions/auth.actions';
import {AppUser} from '../model/list/app-user';

export interface State {
    user: AppUser;
}

export const initialState: State = {
    user: null
};

export function reducer(state = initialState, action: AuthActions): State {
  switch (action.type) {

    case AuthActionTypes.LoadAuths:
      return state;


    default:
      return state;
  }
}
