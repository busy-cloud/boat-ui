import {Component} from '@angular/core';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzInputDirective, NzInputGroupComponent} from 'ng-zorro-antd/input';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzTooltipDirective} from 'ng-zorro-antd/tooltip';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzColDirective} from 'ng-zorro-antd/grid';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {Md5} from 'ts-md5';
import {Router} from '@angular/router';
import {UserService} from '../user.service';
import {SmartRequestService} from '../lib/smart-request.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NzCardComponent,
    NzInputGroupComponent,
    NzInputDirective,
    NzIconDirective,
    NzTooltipDirective,
    NzFormDirective,
    NzFormItemComponent,
    NzButtonComponent,
    NzFormLabelComponent,
    NzFormControlComponent,
    NzColDirective,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  group: FormGroup;

  constructor(formBuilder: FormBuilder,
              private router: Router,
              private ns: NzNotificationService,
              private rs: SmartRequestService,
              private us: UserService,
              ) {
    this.group = formBuilder.group({
      username: ['admin', Validators.required],
      password: ['', Validators.required],
    })
  }

  submit() {

    if (this.group.invalid){
      this.ns.error("错误", "无效账号密码")
      Object.values(this.group.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return
    }

    let obj = this.group.value
    this.rs.post("admin/login", {...obj, password: Md5.hashStr(obj.password)}).subscribe(res => {
      console.log("login", res)
      if (res.error) {
        return
      }
      this.us.set(res.data)
      this.router.navigateByUrl('admin/dash')
    })
  }
}
