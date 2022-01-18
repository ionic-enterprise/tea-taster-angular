import { User } from '@app/models';
import {
  login,
  loginFailure,
  loginSuccess,
  logout,
  logoutFailure,
  logoutSuccess,
  sessionLocked,
  unauthError,
  unlockSessionSuccess,
} from '@app/store/actions';
import { initialState, reducer } from './auth.reducer';

it('returns the default state', () => {
  expect(reducer(undefined, { type: 'NOOP' })).toEqual(initialState);
});

describe('Login', () => {
  it('sets the loading flag and clears other data', () => {
    const action = login({});
    expect(
      reducer(
        {
          loading: false,
          errorMessage: 'Invalid Email or Password',
        },
        action
      )
    ).toEqual({
      loading: true,
      errorMessage: '',
    });
  });
});

describe('Login Success', () => {
  it('clears the loading flag and sets the user', () => {
    const user: User = {
      id: 42,
      firstName: 'Douglas',
      lastName: 'Adams',
      email: 'solong@thanksforthefish.com',
    };
    const action = loginSuccess({ user });
    expect(reducer({ loading: true, errorMessage: '' }, action)).toEqual({
      user,
      loading: false,
      errorMessage: '',
    });
  });
});

describe('Login Failure', () => {
  it('clears the loading flag and sets the error', () => {
    const action = loginFailure({
      errorMessage: 'There was a failure, it was a mess',
    });
    expect(reducer({ loading: true, errorMessage: '' }, action)).toEqual({
      loading: false,
      errorMessage: 'There was a failure, it was a mess',
    });
  });
});

describe('Session Locked', () => {
  it('clears the user', () => {
    const user: User = {
      id: 42,
      firstName: 'Douglas',
      lastName: 'Adams',
      email: 'solong@thanksforthefish.com',
    };
    const action = sessionLocked();
    expect(reducer({ user, loading: false, errorMessage: '' }, action)).toEqual({
      loading: false,
      errorMessage: '',
    });
  });
});

describe('Unlock Session Success', () => {
  it('sets the user', () => {
    const user: User = {
      id: 42,
      firstName: 'Douglas',
      lastName: 'Adams',
      email: 'solong@thanksforthefish.com',
    };
    const action = unlockSessionSuccess({ user });
    expect(reducer({ loading: false, errorMessage: '' }, action)).toEqual({
      user,
      loading: false,
      errorMessage: '',
    });
  });
});

describe('logout actions', () => {
  let user: User;
  beforeEach(
    () =>
      (user = {
        id: 42,
        firstName: 'Douglas',
        lastName: 'Adams',
        email: 'solong@thanksforthefish.com',
      })
  );

  describe('Logout', () => {
    it('sets the loading flag and clears the error message', () => {
      const action = logout();
      expect(
        reducer(
          {
            user,
            loading: false,
            errorMessage: 'this is useless information',
          },
          action
        )
      ).toEqual({
        user,
        loading: true,
        errorMessage: '',
      });
    });
  });

  describe('Logout Success', () => {
    it('clears the loading flag and the user', () => {
      const action = logoutSuccess();
      expect(reducer({ user, loading: true, errorMessage: '' }, action)).toEqual({
        loading: false,
        errorMessage: '',
      });
    });
  });

  describe('Logout Failure', () => {
    it('clears the loading flag and sets the error', () => {
      const action = logoutFailure({
        errorMessage: 'There was a failure, it was a mess',
      });
      expect(reducer({ user, loading: true, errorMessage: '' }, action)).toEqual({
        user,
        loading: false,
        errorMessage: 'There was a failure, it was a mess',
      });
    });
  });

  describe('Unauth Error', () => {
    it('clears the user', () => {
      const action = unauthError();
      expect(
        reducer(
          {
            user: {
              id: 42,
              firstName: 'Douglas',
              lastName: 'Adams',
              email: 'solong@thanksforthefish.com',
            },
            loading: false,
            errorMessage: '',
          },
          action
        )
      ).toEqual({ loading: false, errorMessage: '' });
    });
  });
});
