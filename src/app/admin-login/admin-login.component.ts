import {Component, ViewChild} from '@angular/core';
import {SmartEditorComponent, SmartField} from '../lib/smart-editor/smart-editor.component';
import {Router} from '@angular/router';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {SmartRequestService} from '../lib/smart-request.service';
import {UserService} from '../user.service';
import {Md5} from 'ts-md5';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzButtonComponent} from 'ng-zorro-antd/button';

@Component({
  selector: 'app-admin-login',
  imports: [
    NzCardComponent,
    SmartEditorComponent,
    NzButtonComponent
  ],
  templateUrl: './admin-login.component.html',
  standalone: true,
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent {

  fields: SmartField[] = [
    {key: 'username', type: 'text', label: '用户名', required: true},
    {key: 'password', type: 'password', label: '密码', required: true},
  ]

  @ViewChild("editor", {static: true}) editor!: SmartEditorComponent;

  constructor(private router: Router,
              private ns: NzNotificationService,
              private request: SmartRequestService,
              private us: UserService,
  ) {
  }

  submit() {

    if (!this.editor.valid) {
      this.ns.error("错误", "无效账号密码")
      return
    }

    let obj = this.editor.value
    this.request.post("login", {...obj, password: Md5.hashStr(obj.password)}).subscribe(res => {
      console.log("login", res)
      if (res.error) {
        return
      }
      this.us.set(res.data)
      this.router.navigateByUrl('/')
    })
  }
}
