import { TastingNote, Tea } from '@app/models';
import * as Actions from '@app/store/actions';
import { createReducer, on } from '@ngrx/store';

export interface DataState {
  notes: Array<TastingNote>;
  teas: Array<Tea>;
  loading: boolean;
  errorMessage: string;
}

export const initialState: DataState = {
  notes: [],
  teas: [],
  loading: false,
  errorMessage: '',
};

export const reducer = createReducer(
  initialState,
  on(
    Actions.loginSuccess,
    (state): DataState => ({
      ...state,
      errorMessage: '',
      loading: true,
    })
  ),
  on(
    Actions.unlockSessionSuccess,
    (state): DataState => ({
      ...state,
      loading: true,
      errorMessage: '',
    })
  ),
  on(
    Actions.initialLoadSuccess,
    (state, { teas }): DataState => ({
      ...state,
      loading: false,
      teas: [...teas],
    })
  ),
  on(
    Actions.initialLoadFailure,
    (state, { errorMessage }): DataState => ({
      ...state,
      loading: false,
      errorMessage,
    })
  ),
  on(
    Actions.logoutSuccess,
    (state): DataState => ({
      ...state,
      notes: [],
      teas: [],
    })
  ),
  on(Actions.teaDetailsChangeRatingSuccess, (state, { tea }): DataState => {
    const teas = [...state.teas];
    const idx = state.teas.findIndex((t) => t.id === tea.id);
    if (idx > -1) {
      teas.splice(idx, 1, tea);
    }
    return { ...state, teas };
  }),
  on(
    Actions.teaDetailsChangeRatingFailure,
    (state, { errorMessage }): DataState => ({
      ...state,
      errorMessage,
    })
  ),
  on(
    Actions.notesPageLoaded,
    (state): DataState => ({
      ...state,
      loading: true,
      errorMessage: '',
    })
  ),
  on(
    Actions.notesPageLoadedSuccess,
    (state, { notes }): DataState => ({
      ...state,
      loading: false,
      notes,
    })
  ),
  on(
    Actions.notesPageLoadedFailure,
    (state, { errorMessage }): DataState => ({
      ...state,
      loading: false,
      errorMessage,
    })
  ),
  on(
    Actions.noteSaved,
    (state): DataState => ({
      ...state,
      loading: true,
      errorMessage: '',
    })
  ),
  on(Actions.noteSavedSuccess, (state, { note }): DataState => {
    const notes = [...state.notes];
    const idx = notes.findIndex((n) => n.id === note.id);
    if (idx > -1) {
      notes.splice(idx, 1, note);
    } else {
      notes.push(note);
    }
    return {
      ...state,
      notes,
      loading: false,
    };
  }),
  on(
    Actions.noteSavedFailure,
    (state, { errorMessage }): DataState => ({
      ...state,
      loading: false,
      errorMessage,
    })
  ),
  on(
    Actions.noteDeleted,
    (state): DataState => ({
      ...state,
      loading: true,
      errorMessage: '',
    })
  ),
  on(Actions.noteDeletedSuccess, (state, { note }): DataState => {
    const notes = [...state.notes];
    const idx = notes.findIndex((n) => n.id === note.id);
    if (idx > -1) {
      notes.splice(idx, 1);
    }
    return {
      ...state,
      notes,
      loading: false,
    };
  }),
  on(
    Actions.noteDeletedFailure,
    (state, { errorMessage }): DataState => ({
      ...state,
      loading: false,
      errorMessage,
    })
  )
);
