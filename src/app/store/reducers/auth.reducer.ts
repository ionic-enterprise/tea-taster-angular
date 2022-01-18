import { createReducer, on } from '@ngrx/store';
import * as Actions from '@app/store/actions';
import { User } from '@app/models';

export interface AuthState {
  user?: User;
  loading: boolean;
  errorMessage: string;
}

export const initialState: AuthState = {
  loading: false,
  errorMessage: '',
};

export const reducer = createReducer(
  initialState,
  on(
    Actions.login,
    (state): AuthState => ({
      ...state,
      loading: true,
      errorMessage: '',
    })
  ),
  on(
    Actions.loginSuccess,
    (state, { user }): AuthState => ({
      ...state,
      user,
      loading: false,
    })
  ),
  on(
    Actions.loginFailure,
    (state, { errorMessage }): AuthState => ({
      ...state,
      loading: false,
      errorMessage,
    })
  ),
  on(
    Actions.logout,
    (state): AuthState => ({
      ...state,
      loading: true,
      errorMessage: '',
    })
  ),
  on(Actions.logoutSuccess, (state): AuthState => {
    const { user, ...newState } = {
      ...state,
      loading: false,
    };
    return newState;
  }),
  on(
    Actions.logoutFailure,
    (state, { errorMessage }): AuthState => ({
      ...state,
      loading: false,
      errorMessage,
    })
  ),
  on(Actions.unauthError, (state): AuthState => {
    const { user, ...newState } = state;
    return newState;
  }),
  on(Actions.sessionLocked, (state): AuthState => {
    const { user, ...newState } = state;
    return newState;
  }),
  on(
    Actions.unlockSessionSuccess,
    (state, { user }): AuthState => ({
      ...state,
      user,
    })
  )
);
