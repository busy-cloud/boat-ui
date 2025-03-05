import {GuardResult, MaybeAsync, Route, Router, Routes, UrlSegment} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {UserService} from './user.service';
import {inject} from '@angular/core';

export const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: '/admin'},
  {path: 'login', component: LoginComponent},
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [loginGuard]
  },
];

function loginGuard(router: Router, segments: UrlSegment[]): MaybeAsync<GuardResult> {
  let us = inject(UserService)
  if (us.valid()) return true
  else return router.parseUrl("/login");
}
