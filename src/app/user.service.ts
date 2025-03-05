import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private _user: any

  constructor() {
    //TODO 自动加载登录状态，此处应该有token
    let u = localStorage.getItem('user')
    if (u) this._user = JSON.parse(u)
  }

  get user() {
    return this._user || {};
  }

  set(user: any) {
    this._user = user;
    localStorage.setItem("user", JSON.stringify(user));
  }

  unset(user: any) {
    this._user = undefined;
    localStorage.removeItem("user");
  }

  valid() {
    return !!this._user
  }


}
