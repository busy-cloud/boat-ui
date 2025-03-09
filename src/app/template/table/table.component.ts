import {Component} from '@angular/core';
import {
  GetActionLink,
  GetActionParams,
  ParamSearch,
  SmartActionRow,
  SmartTableColumn,
  SmartTableComponent,
  SmartTableOperator
} from '../../lib/smart-table/smart-table.component';
import {SmartRequestService} from '../../lib/smart-request.service';
import {ActivatedRoute, Router} from '@angular/router';
import {isFunction} from 'rxjs/internal/util/isFunction';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {Title} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {PageComponent} from '../../page/page.component';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {SmartToolbarComponent} from '../../lib/smart-toolbar/smart-toolbar.component';
import {TemplateBase} from '../template-base.component';


@Component({
  selector: 'app-table',
  imports: [
    SmartTableComponent,
    NzCardComponent,
    CommonModule,
    NzSpinComponent,
    NzButtonComponent,
    NzIconDirective,
    SmartToolbarComponent,
  ],
  templateUrl: './table.component.html',
  standalone: true,
  styleUrl: './table.component.scss',
  inputs: ['app', 'page', 'content', 'params', 'data']
})
export class TableComponent extends TemplateBase{

  total = 0

  constructor(request: SmartRequestService, modal: NzModalService, route: ActivatedRoute, router: Router, title: Title) {
    super(request, modal, route, router, title)
  }

  override build() {
    console.log("[table] build", this.page)
    if (!this.content || this.content.template !== "table" )return
    if (typeof this.content.search_func == "string") {
      try {
        //@ts-ignore
        this.content.search_func = new Function('params', 'request', this.content.search_func as string)
      } catch (e) {
        console.error(e)
      }
    }
  }

  $event: ParamSearch = {filter: {}}

  onQuery($event?: ParamSearch) {
    console.log("[table] query", this.page)
    if (!this.content || this.content.template !== "table" )return

    //默认用上次搜索
    if (!$event) $event = this.$event
    else this.$event = $event

    //搜索
    if (isFunction(this.content.search_func)) {
      this.loading = true
      this.content?.search_func($event, this.request).then((res: any) => {
        this.data = res.data
        this.total = res.total || res.data.length
      }).finally(() => {
        this.loading = false
      })
    } else if (this.content.search_url) {
      this.loading = true
      this.request.post(this.content.search_url, $event).subscribe(res => {
        if (res.error) return
        this.data = res.data
        this.total = res.total || res.data.length
      }).add(() => {
        this.loading = false
      })
    }
  }

  refresh(){
    this.onQuery()
  }

  executeTable($event: SmartActionRow) {
    if (!$event.action) return

    let params = GetActionParams($event.action, $event.data)

    switch ($event.action.type) {
      case 'link':
        let uri = GetActionLink($event.action, $event.data)
        let query = new URLSearchParams(params).toString()
        let url = uri + '?' + query

        if ($event.action.external)
          window.open(url)
        else
          this.router.navigateByUrl(url)
        //this.router.navigate([uri], {queryParams: params})

        break

      case 'script':
        if (typeof $event.action.script == "string") {
          try {
            $event.action.script = new Function("params", "request", $event.action.script)
          } catch (e) {
            console.error(e)
          }
        }
        if (isFunction($event.action.script)) {
          //action.script(data)
          //@ts-ignore
          action.script.call(this, params, this.request)
        }
        break

      case 'page':
        this.router.navigate(["page", $event.action.page], {queryParams: params})
        break

      case 'dialog':
        //弹窗
        this.modal.create({
          nzContent: PageComponent,
          nzData: {
            page: $event.action.page,
            params: params
          }
        })
        break
    }
  }


}
