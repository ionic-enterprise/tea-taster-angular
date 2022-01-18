import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';

import {
  loginSuccess,
  initialLoadSuccess,
  initialLoadFailure,
  notesPageLoaded,
  notesPageLoadedFailure,
  notesPageLoadedSuccess,
  noteDeleted,
  noteDeletedFailure,
  noteDeletedSuccess,
  noteSaved,
  noteSavedFailure,
  noteSavedSuccess,
  startup,
  teaDetailsChangeRating,
  teaDetailsChangeRatingFailure,
  teaDetailsChangeRatingSuccess,
  unlockSessionSuccess,
} from '@app/store/actions';
import { AuthenticationService, TastingNotesService, TeaService } from '@app/core';

@Injectable()
export class DataEffects {
  sessionLoaded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginSuccess, startup, unlockSessionSuccess),
      mergeMap(() =>
        from(this.auth.isAuthenticated()).pipe(
          mergeMap((isAuth) => (isAuth ? this.teaService.getAll() : of([]))),
          map((teas) => initialLoadSuccess({ teas })),
          catchError(() =>
            of(
              initialLoadFailure({
                errorMessage: 'Error in data load, check server logs',
              })
            )
          )
        )
      )
    )
  );

  teaRatingChanged$ = createEffect(() =>
    this.actions$.pipe(
      ofType(teaDetailsChangeRating),
      mergeMap((action) =>
        from(this.teaService.save({ ...action.tea, rating: action.rating })).pipe(
          map(() =>
            teaDetailsChangeRatingSuccess({
              tea: { ...action.tea, rating: action.rating },
            })
          ),
          catchError((err) =>
            of(
              teaDetailsChangeRatingFailure({
                errorMessage: err.message || 'Unknown error in rating save',
              })
            )
          )
        )
      )
    )
  );

  notesPageLoaded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(notesPageLoaded),
      mergeMap(() =>
        this.tastingNotesService.getAll().pipe(
          map((notes) => notesPageLoadedSuccess({ notes })),
          catchError(() =>
            of(
              notesPageLoadedFailure({
                errorMessage: 'Error in data load, check server logs',
              })
            )
          )
        )
      )
    )
  );

  noteSaved$ = createEffect(() =>
    this.actions$.pipe(
      ofType(noteSaved),
      mergeMap((action) =>
        this.tastingNotesService.save(action.note).pipe(
          map((note) => noteSavedSuccess({ note })),
          catchError(() =>
            of(
              noteSavedFailure({
                errorMessage: 'Error in data load, check server logs',
              })
            )
          )
        )
      )
    )
  );

  noteDeleted$ = createEffect(() =>
    this.actions$.pipe(
      ofType(noteDeleted),
      mergeMap((action) =>
        this.tastingNotesService.delete(action.note.id).pipe(
          map(() => noteDeletedSuccess({ note: action.note })),
          catchError(() =>
            of(
              noteDeletedFailure({
                errorMessage: 'Error in data load, check server logs',
              })
            )
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private auth: AuthenticationService,
    private tastingNotesService: TastingNotesService,
    private teaService: TeaService
  ) {}
}
