import { Component } from '@angular/core';
import {NzContentComponent, NzHeaderComponent, NzLayoutComponent, NzSiderComponent} from 'ng-zorro-antd/layout';
import {NzDropDownDirective, NzDropdownMenuComponent} from 'ng-zorro-antd/dropdown';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzMenuDirective, NzMenuDividerDirective, NzMenuItemComponent, NzSubMenuComponent} from 'ng-zorro-antd/menu';
import {RouterLink, RouterOutlet} from '@angular/router';
import {UserService} from '../user.service';
import {SmartRequestService} from '../lib/smart-request.service';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    NzContentComponent,
    NzDropDownDirective,
    NzDropdownMenuComponent,
    NzHeaderComponent,
    NzIconDirective,
    NzLayoutComponent,
    NzMenuDirective,
    NzMenuDividerDirective,
    NzMenuItemComponent,
    NzSiderComponent,
    NzSubMenuComponent,
    RouterLink,
    RouterOutlet,
    NgOptimizedImage
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  isCollapsed = false;
  oem: any = {
    name: 'BOAT',
    logo: '/boat.svg',
    company: '南京本易物联网有限公司',
  }

  settings: any[] = []

  constructor(protected us: UserService, private rs: SmartRequestService) {
    this.loadOem()
    this.loadMenu()
    this.loadSetting()
  }

  loadOem() {
    this.rs.get("oem").subscribe((res) => {
      if (res.err) return
      Object.assign(this.oem, res.data);
    })
  }

  loadMenu() {
    this.rs.get("menu").subscribe((res) => {
      if (res.err) return
    })
  }

  loadSetting() {
    this.rs.get("settings").subscribe((res) => {
      if (res.err) return
      this.settings = res.data
    })
  }
}
