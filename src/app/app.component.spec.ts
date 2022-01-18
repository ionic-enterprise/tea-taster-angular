import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { createPlatformMock } from '@test/mocks';
import { AppComponent } from './app.component';
import { SessionVaultService } from './core';
import { createSessionVaultServiceMock } from './core/testing';
import { startup } from './store/actions';

describe('AppComponent', () => {
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [AppComponent],
        providers: [
          provideMockStore(),
          { provide: Platform, useFactory: createPlatformMock },
          { provide: SessionVaultService, useFactory: createSessionVaultServiceMock },
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
      }).compileComponents();
    })
  );

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it('dispatches startup', () => {
    const store = TestBed.inject(Store);
    spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledWith(startup());
  });
});
