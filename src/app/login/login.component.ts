import {Component, ViewChild} from '@angular/core';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {Md5} from 'ts-md5';
import {Router} from '@angular/router';
import {UserService} from '../user.service';
import {SmartRequestService} from '../lib/smart-request.service';
import {SmartEditorComponent, SmartField} from '../lib/smart-editor/smart-editor.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    SmartEditorComponent,
    NzCardComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

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
      this.router.navigateByUrl('admin')
    })
  }
}
