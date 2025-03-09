import {Component} from '@angular/core';
import {ParamSearch, ReplaceLinkParams, SmartTableComponent} from '../../lib/smart-table/smart-table.component';
import {SmartRequestService} from '../../lib/smart-request.service';
import {ActivatedRoute, Router} from '@angular/router';
import {isFunction} from 'rxjs/internal/util/isFunction';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {Title} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {SmartToolbarComponent} from '../../lib/smart-toolbar/smart-toolbar.component';
import {TemplateBase} from '../template-base.component';
import {TableContent} from '../template';


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
export class TableComponent extends TemplateBase {

  total = 0

  constructor(request: SmartRequestService, modal: NzModalService, route: ActivatedRoute, router: Router, title: Title) {
    super(request, modal, route, router, title)
  }

  $event: ParamSearch = {filter: {}}

  search($event?: ParamSearch) {
    console.log("[table] query", this.page)
    const content = this.content as TableContent
    if (!content) return

    //默认用上次搜索
    if (!$event) $event = this.$event
    else this.$event = $event

    //搜索
    if (typeof content.search == "string" && content.search.length > 0) {
      try {
        content.search = new Function("param", "request", content.search)
      } catch (e) {
        console.error(e)
      }
    }
    if (isFunction(content.search)) {
      this.loading = true
      content.search($event, this.request).then((res: any) => {
        this.data = res.data
        this.total = res.total || res.data.length
      }).finally(() => {
        this.loading = false
      })
    } else if (content.search_api) {
      this.loading = true
      let url = ReplaceLinkParams(content.search_api, this.params);
      this.request.post(url, $event).subscribe(res => {
        if (res.error) return
        this.data = res.data
        this.total = res.total || res.data.length
      }).add(() => {
        this.loading = false
      })
    }
  }

  refresh() {
    this.search()
  }

}
