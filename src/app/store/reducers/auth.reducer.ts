import { createReducer, on } from '@ngrx/store';
import * as Actions from '@app/store/actions';
import { Session } from '@app/models';

export interface AuthState {
  session?: Session;
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
    (state, { session }): AuthState => ({
      ...state,
      session,
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
    const { session, ...newState } = {
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
  on(Actions.sessionLocked, (state): AuthState => {
    const { session, ...newState } = state;
    return newState;
  }),
  on(
    Actions.sessionRestored,
    (state, { session }): AuthState => ({
      ...state,
      session,
    })
  ),
  on(Actions.unauthError, (state): AuthState => {
    const { session, ...newState } = state;
    return newState;
  })
);
