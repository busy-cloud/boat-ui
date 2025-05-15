import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { UserService } from '../user.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import {SmartRequestService} from '../lib/smart-request.service';
import {NzContentComponent, NzFooterComponent, NzHeaderComponent, NzLayoutComponent} from 'ng-zorro-antd/layout';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NgForOf, NgIf} from '@angular/common';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {WindowComponent} from './window.component';

@Component({
  selector: 'app-desktop',
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.scss'],
  imports: [
    NzLayoutComponent,
    NzHeaderComponent,
    NzContentComponent,
    NzRowDirective,
    NzColDirective,
    NgForOf,
    NzFooterComponent,
    NzIconDirective,
    WindowComponent,
    NgIf
  ],
  standalone: true
})
export class DesktopComponent {
  title: any;
  show: any;
  entries: any = [];
  items: any[] = [];
  userInfo: any;
  showMenu = false;
  appIndex: any = {};

  constructor(
    private router: Router,
    private rs: SmartRequestService,
    private ms: NzModalService,
    private us: UserService,
    private msg: NzMessageService
  ) {
    this.userInfo = us && us.user;
    // this._as.apps
    //   ? this._as.apps.filter((item: any, index) => {
    //     this.appIndex[item.name] = index;
    //   })
    //   : '';
  }

  hide(mes: any) {
    this.items.filter((item: any, index: any) => {
      if (item.title === mes) {
        item.show = false;
        item.tab = true;
      }
    });
  }
  setIndex(mes: any) {
    this.items.filter((item: any, index: any) => {
      item.index = 0;
      if (item.title === mes) {
        item.index = 9999;
      }
    });
  }

  close(mes: any) {
    this.items.filter((item: any, index: any) => {
      if (item.title === mes) {
        this.items.splice(index, 1);
      }
    });
  }

  showTab(mes: any) {
    this.items.filter((item: any, index: any) => {
      if (item.title === mes) {
        item.show = true;
        item.tab = false;
      }
    });
    this.setIndex(mes);
  }

  open(app: any) {
    if (window.innerWidth < 800) {
      this.router.navigate([app.entries[0].path]);
      return;
    }

    if (
      !this.items.some((item: any) => {
        return item.title === app.name;
      })
    )
      this.items.push({
        show: true,
        entries: app.entries,
        title: app.name,
        index: 0,
      });
    this.showTab(app.name);
    this.setIndex(app.name);
  }


  setMenu(status: any, name: any) {
    //this._as.apps[this.appIndex[name]].status = !status;
    this.msg.success('设置成功');
  }

  logout() {
    this.rs
      .get('logout')
      .subscribe((res) => {})
      .add(() => this.router.navigateByUrl('/login'));
  }
}
