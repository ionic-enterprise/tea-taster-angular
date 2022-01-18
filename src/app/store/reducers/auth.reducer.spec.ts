import { Session } from '@app/models';
import {
  login,
  loginFailure,
  loginSuccess,
  logout,
  logoutFailure,
  logoutSuccess,
  sessionLocked,
  sessionRestored,
  unauthError,
} from '@app/store/actions';
import { initialState, reducer } from './auth.reducer';

it('returns the default state', () => {
  expect(reducer(undefined, { type: 'NOOP' })).toEqual(initialState);
});

describe('Login', () => {
  it('sets the loading flag and clears other data', () => {
    const action = login({ email: 'test@testy.com', password: 'mysecret' });
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
  it('clears the loading flag and sets the session', () => {
    const session: Session = {
      user: {
        id: 42,
        firstName: 'Douglas',
        lastName: 'Adams',
        email: 'solong@thanksforthefish.com',
      },
      token: 'Imalittletoken',
    };
    const action = loginSuccess({ session });
    expect(reducer({ loading: true, errorMessage: '' }, action)).toEqual({
      session,
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

describe('Session Restored', () => {
  it('sets the session', () => {
    const session: Session = {
      user: {
        id: 42,
        firstName: 'Douglas',
        lastName: 'Adams',
        email: 'solong@thanksforthefish.com',
      },
      token: 'Imalittletoken',
    };
    const action = sessionRestored({ session });
    expect(reducer({ loading: false, errorMessage: '' }, action)).toEqual({
      session,
      loading: false,
      errorMessage: '',
    });
  });
});

describe('Session Locked', () => {
  it('clears the session', () => {
    const session: Session = {
      user: {
        id: 42,
        firstName: 'Douglas',
        lastName: 'Adams',
        email: 'solong@thanksforthefish.com',
      },
      token: 'Imalittletoken',
    };
    const action = sessionLocked();
    expect(reducer({ session, loading: false, errorMessage: '' }, action)).toEqual({
      loading: false,
      errorMessage: '',
    });
  });
});

describe('logout actions', () => {
  let session: Session;
  beforeEach(
    () =>
      (session = {
        user: {
          id: 42,
          firstName: 'Douglas',
          lastName: 'Adams',
          email: 'solong@thanksforthefish.com',
        },
        token: 'Imalittletoken',
      })
  );

  describe('Logout', () => {
    it('sets the loading flag and clears the error message', () => {
      const action = logout();
      expect(
        reducer(
          {
            session,
            loading: false,
            errorMessage: 'this is useless information',
          },
          action
        )
      ).toEqual({
        session,
        loading: true,
        errorMessage: '',
      });
    });
  });

  describe('Logout Success', () => {
    it('clears the loading flag and the session', () => {
      const action = logoutSuccess();
      expect(reducer({ session, loading: true, errorMessage: '' }, action)).toEqual({
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
      expect(reducer({ session, loading: true, errorMessage: '' }, action)).toEqual({
        session,
        loading: false,
        errorMessage: 'There was a failure, it was a mess',
      });
    });
  });
});

describe('Unauth Error', () => {
  it('clears the session', () => {
    const action = unauthError();
    expect(
      reducer(
        {
          session: {
            user: {
              id: 42,
              firstName: 'Douglas',
              lastName: 'Adams',
              email: 'solong@thanksforthefish.com',
            },
            token: 'Imalittletoken',
          },
          loading: false,
          errorMessage: '',
        },
        action
      )
    ).toEqual({ loading: false, errorMessage: '' });
  });
});
