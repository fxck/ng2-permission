import {
  Directive,
  Injectable,
  Injector,
  ViewContainerRef,
  TemplateRef
} from 'angular2/core';
import { Router, ComponentInstruction } from 'angular2/router';

import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/take';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class Ng2Permission {
  private _store: Object = {};

  constructor(private _router: Router) {}

  public define(name: string, validation) {
    this._store[name] = validation;
  }

  public authorize(authObj) {
    if (authObj.only && authObj.except) {
      throw new Error('Authorization object cannot contain both [only] and [except]');
    }

    if (authObj.only) {
      return this._checkAuthorization(authObj.only, 'only');
    }

    if (authObj.except) {
      return this._checkAuthorization(authObj.except, 'except');
    }

  }

  private _checkAuthorization(names, type) {
    if (names.length > 1) {
      var mergeObsrArr: Array<Observable<boolean>> = [];

      names.forEach((res) => {
        if (this._store[res]) {
          mergeObsrArr.push(this._store[res].call().first());

        } else {
          console.warn(`NgPermission: No defined validation for ${res}`);
        }
      });

        return Observable
          .merge(...mergeObsrArr)
          .first(res => {
            if (type === 'only') {
              return !!res;
            }

            if (type === 'except') {
              return !res;
            }
          }, null, false);

    } else {
      return this._store[names[0]].call()
        .take(1)
        .map(res => {
          if (type === 'only') {
            return !!res;
          }

          if (type === 'except') {
            return !res;
          }
        });
    }
  }
}

let appInjectorRef: Injector;
export const appInjector = (injector?: Injector):Injector => {
  if (injector) {
    appInjectorRef = injector;
  }

  return appInjectorRef;
};

export const authorizeComponent = (authObj) => {
  let _injector: Injector = appInjector();
  let _permission: Ng2Permission = _injector.get(Ng2Permission);
  let _router: Router = _injector.get(Router);

  return new Promise((resolve) => {
    _permission
      .authorize(authObj)
      .subscribe(res => {
        if (res) {
          resolve(true);
        } else {
          if (authObj.redirect) {
            _router.navigate(authObj.redirect);
          }
          resolve(false);
        }
      });

  });
};
