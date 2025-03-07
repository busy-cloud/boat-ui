import {Component, Input} from '@angular/core';
import {CommonModule} from "@angular/common";
import {NzDescriptionsModule} from "ng-zorro-antd/descriptions";
import {NzProgressComponent} from "ng-zorro-antd/progress";
import {Router} from "@angular/router";
import {NzTagComponent} from "ng-zorro-antd/tag";
import {GetActionLink, GetActionParams, SmartAction} from '../smart-table/smart-table.component';
import {isFunction} from 'rxjs/internal/util/isFunction';
import {PageComponent} from '../../pages/page/page.component';
import {SmartRequestService} from '../smart-request.service';
import {NzModalModule, NzModalService} from 'ng-zorro-antd/modal';


export interface SmartInfoItem {
  key: string
  type?: string
  label: string
  span?: number
  action?: SmartAction
  options?: { [p: string | number]: any }
}

@Component({
  selector: 'smart-info',
  standalone: true,
  imports: [
    CommonModule,
    NzDescriptionsModule,
    NzProgressComponent,
    NzTagComponent,
    NzModalModule,
  ],
  templateUrl: './smart-info.component.html',
  styleUrl: './smart-info.component.scss'
})
export class SmartInfoComponent {
  @Input() title: string = '';
  @Input() fields: SmartInfoItem[] = []
  @Input() value: any = {}

  constructor(protected router: Router, protected rs: SmartRequestService, protected ms: NzModalService) {
  }

  execute(action: SmartAction | undefined) {
    if (!action) return

    let params = GetActionParams(action, this.value)

    switch (action.type) {
      case 'link':

        let uri = GetActionLink(action, this.value)
        let query = new URLSearchParams(params).toString()
        let url = uri + '?' + query

        if (action.external)
          window.open(url)
        else
          this.router.navigateByUrl(url)
        //this.router.navigate([uri], {queryParams: params})

        break

      case 'script':
        if (typeof action.script == "string") {
          try {
            action.script = new Function("data", "request", action.script)
          }catch (e) {
            console.error(e)
          }
        }
        if (isFunction(action.script)) {
          action.script.call(this, this.value, this.rs)
        }
        break

      case 'page':
        this.router.navigate(["page", action.page], {queryParams: params})
        break

      case 'dialog':
        this.ms.create({
          nzContent: PageComponent,
          nzData: {
            page: action.page,
            params: params
          }
        })
        break

    }
  }
}
