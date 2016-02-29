# ng2-permission
Small service to go along @brandonroberts' `@CanActive()` hack - http://plnkr.co/edit/SF8gsYN1SvmUbkosHjqQ?p=preview


# Usage
1) import service and add it to your bootstrap
```typescript

import { Ng2Permission, appInjector } from './app/services/Ng2Permission';

bootstrap(App, [
	Ng2Permission
])
```

2) inject `Ng2Permission` and define roles in your root component and their validation function that has to return `Observable` that results in either `true` or `false`

```typescript

export class App {
  constructor(public auth: AuthModel, private _permission: Ng2Permission) {
    _permission.define('user', () => {
      /*
        var isAuthenticated$ = Observable.of({
			name: null,
			mail: null,
			role: null,
			isAuthenticated: false,
			token: null
        }).map(res => res.isAuthenticated);
      */
      return auth.isAuthenticated$;
    });

    _permission.define('admin', () => {
      return auth.data$.map(res => res.isAuthenticated && res.role === ADMIN ? true : false);
    });
  }
}

```

3) use it along `@CanActivate` in routes you want to protect

```typescript

import { authorizeComponent } from '../../../services/Ng2Permission';

// only users with our defined roles of 'user' or 'admin' will be alowed to enter, others will be redirected to home component
@CanActivate(() => {
  return authorizeComponent({
    only: ['user', 'admin'],
    // use `only` or `except`
    // except: ['user']
    redirect: ['/Home']
  })
})
@Component({
  selector: 'protected-component-route'
})
export class ProtectedComponentRoute {}

```

..or in your Components or directives as observable

```typescript
import { Ng2Permission } from '../../../services/Ng2Permission';

@Component({
  selector: 'some-component',
})
export class SomeComponent {
	constructor(private _perm: Ng2Permission) {
		_perm
			.authorize({
				only: ['admin']
			})
			.subscribe(res => {
				// returns true or false
				console.log(res);
			});
	}
}

```
