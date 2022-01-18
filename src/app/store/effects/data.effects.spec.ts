import { TestBed } from '@angular/core/testing';
import { AuthenticationService, TastingNotesService, TeaService } from '@app/core';
import {
  createAuthenticationServiceMock,
  createTastingNotesServiceMock,
  createTeaServiceMock,
} from '@app/core/testing';
import { TastingNote, Tea, User } from '@app/models';
import {
  loginSuccess,
  noteDeleted,
  noteSaved,
  notesPageLoaded,
  startup,
  teaDetailsChangeRating,
  unlockSessionSuccess,
} from '@app/store/actions';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { DataEffects } from './data.effects';

describe('DataEffects', () => {
  let actions$: Observable<any>;
  let effects: DataEffects;

  const notes: Array<TastingNote> = [
    {
      id: 42,
      brand: 'Lipton',
      name: 'Green Tea',
      teaCategoryId: 3,
      rating: 3,
      notes: 'A basic green tea, very passable but nothing special',
    },
    {
      id: 314159,
      brand: 'Lipton',
      name: 'Yellow Label',
      teaCategoryId: 2,
      rating: 1,
      notes: 'Very acidic, even as dark teas go, OK for iced tea, horrible for any other application',
    },
    {
      id: 73,
      brand: 'Rishi',
      name: 'Puer Cake',
      teaCategoryId: 6,
      rating: 5,
      notes: 'Smooth and peaty, the king of puer teas',
    },
  ];

  const user: User = {
    id: 314,
    firstName: 'Kevin',
    lastName: 'Minion',
    email: 'goodtobebad@gru.org',
  };

  const teas: Array<Tea> = [
    {
      id: 1,
      name: 'Green',
      image: 'assets/img/green.jpg',
      description: 'Green teas are green',
    },
    {
      id: 2,
      name: 'Black',
      image: 'assets/img/black.jpg',
      description: 'Black teas are not green',
    },
    {
      id: 3,
      name: 'Herbal',
      image: 'assets/img/herbal.jpg',
      description: 'Herbal teas are not even tea',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DataEffects,
        provideMockActions(() => actions$),
        {
          provide: AuthenticationService,
          useFactory: createAuthenticationServiceMock,
        },
        {
          provide: TastingNotesService,
          useFactory: createTastingNotesServiceMock,
        },
        {
          provide: TeaService,
          useFactory: createTeaServiceMock,
        },
      ],
    });
    effects = TestBed.inject(DataEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  [loginSuccess({ user }), startup(), unlockSessionSuccess({ user })].forEach((action) =>
    describe(`sessionLoaded$ with ${action.type}`, () => {
      describe('when not authenticated', () => {
        beforeEach(() => {
          const auth = TestBed.inject(AuthenticationService);
          (auth.isAuthenticated as any).and.returnValue(Promise.resolve(false));
        });

        it('does not fetch the teas', (done) => {
          const teaService = TestBed.inject(TeaService);
          (teaService.getAll as any).and.returnValue(of(undefined));
          actions$ = of(action);
          effects.sessionLoaded$.subscribe(() => {
            expect(teaService.getAll).not.toHaveBeenCalled();
            done();
          });
        });

        it('dispatches initial load success', (done) => {
          actions$ = of(action);
          effects.sessionLoaded$.subscribe((mappedAction) => {
            expect(mappedAction).toEqual({
              type: '[Data API] initial data load success',
              teas: [],
            });
            done();
          });
        });
      });

      describe('when authenticated', () => {
        beforeEach(() => {
          const auth = TestBed.inject(AuthenticationService);
          (auth.isAuthenticated as any).and.returnValue(Promise.resolve(true));
        });

        it('fetches the teas', (done) => {
          const teaService = TestBed.inject(TeaService);
          (teaService.getAll as any).and.returnValue(of(undefined));
          actions$ = of(action);
          effects.sessionLoaded$.subscribe(() => {
            expect(teaService.getAll).toHaveBeenCalledTimes(1);
            done();
          });
        });

        describe('on success', () => {
          beforeEach(() => {
            const teaService = TestBed.inject(TeaService);
            (teaService.getAll as any).and.returnValue(of(teas));
          });

          it('dispatches initial load success', (done) => {
            actions$ = of(action);
            effects.sessionLoaded$.subscribe((mappedAction) => {
              expect(mappedAction).toEqual({
                type: '[Data API] initial data load success',
                teas,
              });
              done();
            });
          });
        });

        describe('on an exception', () => {
          beforeEach(() => {
            const teaService = TestBed.inject(TeaService);
            (teaService.getAll as any).and.returnValue(throwError(new Error('the server is blowing chunks')));
          });

          it('dispatches initial load failure', (done) => {
            actions$ = of(action);
            effects.sessionLoaded$.subscribe((newAction) => {
              expect(newAction).toEqual({
                type: '[Data API] initial data load failure',
                errorMessage: 'Error in data load, check server logs',
              });
              done();
            });
          });
        });
      });
    })
  );

  describe('teaRatingChanged$', () => {
    it('saves the tea', (done) => {
      const teaService = TestBed.inject(TeaService);
      actions$ = of(teaDetailsChangeRating({ tea: teas[1], rating: 5 }));
      effects.teaRatingChanged$.subscribe(() => {
        expect(teaService.save).toHaveBeenCalledTimes(1);
        expect(teaService.save).toHaveBeenCalledWith({ ...teas[1], rating: 5 });
        done();
      });
    });

    describe('on success', () => {
      it('dispatches tea rating change success', (done) => {
        actions$ = of(teaDetailsChangeRating({ tea: teas[1], rating: 5 }));
        effects.teaRatingChanged$.subscribe((newAction) => {
          expect(newAction).toEqual({
            type: '[Data API] change rating success',
            tea: { ...teas[1], rating: 5 },
          });
          done();
        });
      });
    });

    describe('on an exception', () => {
      beforeEach(() => {
        const teaService = TestBed.inject(TeaService);
        (teaService.save as any).and.returnValue(Promise.reject(new Error('private storage is blowing chunks?')));
      });

      it('dispatches tea rating change failure', (done) => {
        actions$ = of(teaDetailsChangeRating({ tea: teas[1], rating: 5 }));
        effects.teaRatingChanged$.subscribe((newAction) => {
          expect(newAction).toEqual({
            type: '[Data API] change rating failure',
            errorMessage: 'private storage is blowing chunks?',
          });
          done();
        });
      });
    });
  });

  describe('notesPageLoaded$', () => {
    beforeEach(() => {
      const notesService = TestBed.inject(TastingNotesService);
      (notesService.getAll as any).and.returnValue(of(notes));
    });

    it('loads the notes', (done) => {
      const notesService = TestBed.inject(TastingNotesService);
      actions$ = of(notesPageLoaded());
      effects.notesPageLoaded$.subscribe(() => {
        expect(notesService.getAll).toHaveBeenCalledTimes(1);
        done();
      });
    });

    describe('on success', () => {
      it('dispatches notes loaded success', (done) => {
        actions$ = of(notesPageLoaded());
        effects.notesPageLoaded$.subscribe((newAction) => {
          expect(newAction).toEqual({
            type: '[Data API] notes page loaded success',
            notes,
          });
          done();
        });
      });
    });

    describe('on an exception', () => {
      beforeEach(() => {
        const notesService = TestBed.inject(TastingNotesService);
        (notesService.getAll as any).and.returnValue(throwError(new Error('the server is blowing chunks')));
      });

      it('dispatches notes loaded failure with a generic message', (done) => {
        actions$ = of(notesPageLoaded());
        effects.notesPageLoaded$.subscribe((newAction) => {
          expect(newAction).toEqual({
            type: '[Data API] notes page loaded failure',
            errorMessage: 'Error in data load, check server logs',
          });
          done();
        });
      });
    });
  });

  describe('noteSaved$', () => {
    let note: TastingNote;
    let noteWithId: TastingNote;
    beforeEach(() => {
      note = {
        brand: 'Bigalow',
        name: 'Earl Grey',
        teaCategoryId: 5,
        rating: 3,
        notes: 'Not great, but not bad either',
      };
      noteWithId = { ...note, id: 99385 };
      const notesService = TestBed.inject(TastingNotesService);
      (notesService.save as any).and.returnValue(of(noteWithId));
    });

    it('saves the notes', (done) => {
      const notesService = TestBed.inject(TastingNotesService);
      actions$ = of(noteSaved({ note }));
      effects.noteSaved$.subscribe(() => {
        expect(notesService.save).toHaveBeenCalledTimes(1);
        expect(notesService.save).toHaveBeenCalledWith(note);
        done();
      });
    });

    describe('on success', () => {
      it('dispatches note saved success', (done) => {
        actions$ = of(noteSaved({ note }));
        effects.noteSaved$.subscribe((newAction) => {
          expect(newAction).toEqual({
            type: '[Data API] note saved success',
            note: noteWithId,
          });
          done();
        });
      });
    });

    describe('on an exception', () => {
      beforeEach(() => {
        const notesService = TestBed.inject(TastingNotesService);
        (notesService.save as any).and.returnValue(throwError(new Error('the server is blowing chunks')));
      });

      it('dispatches note saved failure with a generic message', (done) => {
        actions$ = of(noteSaved({ note }));
        effects.noteSaved$.subscribe((newAction) => {
          expect(newAction).toEqual({
            type: '[Data API] note saved failure',
            errorMessage: 'Error in data load, check server logs',
          });
          done();
        });
      });
    });
  });

  describe('noteDeleted$', () => {
    beforeEach(() => {
      const notesService = TestBed.inject(TastingNotesService);
      (notesService.delete as any).and.returnValue(of(null));
    });

    it('deletes the notes', (done) => {
      const notesService = TestBed.inject(TastingNotesService);
      actions$ = of(noteDeleted({ note: notes[1] }));
      effects.noteDeleted$.subscribe(() => {
        expect(notesService.delete).toHaveBeenCalledTimes(1);
        expect(notesService.delete).toHaveBeenCalledWith(notes[1].id);
        done();
      });
    });

    describe('on success', () => {
      it('dispatches note deleted success', (done) => {
        actions$ = of(noteDeleted({ note: notes[1] }));
        effects.noteDeleted$.subscribe((newAction) => {
          expect(newAction).toEqual({
            type: '[Data API] note deleted success',
            note: notes[1],
          });
          done();
        });
      });
    });

    describe('on an exception', () => {
      beforeEach(() => {
        const notesService = TestBed.inject(TastingNotesService);
        (notesService.delete as any).and.returnValue(throwError(new Error('the server is blowing chunks')));
      });

      it('dispatches note deleted failure with a generic message', (done) => {
        actions$ = of(noteDeleted({ note: notes[1] }));
        effects.noteDeleted$.subscribe((newAction) => {
          expect(newAction).toEqual({
            type: '[Data API] note deleted failure',
            errorMessage: 'Error in data load, check server logs',
          });
          done();
        });
      });
    });
  });
});
