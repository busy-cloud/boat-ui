import {Component, Input} from '@angular/core';
import {
  GetActionLink,
  GetActionParams,
  ParamSearch, SmartAction, SmartActionRow,
  SmartTableButton,
  SmartTableColumn,
  SmartTableComponent,
  SmartTableOperator
} from '../../lib/smart-table/smart-table.component';
import {SmartRequestService} from '../../lib/smart-request.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {isFunction} from 'rxjs/internal/util/isFunction';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {Title} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {PageComponent, PageContent} from '../../pages/page/page.component';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {SmartToolbarComponent} from '../../lib/smart-toolbar/smart-toolbar.component';


export interface TableContent {
  template: 'table'
  columns: SmartTableColumn[]
  operators: SmartTableOperator[]
  search_url?: string
  search_func?: string | Function | ((event: ParamSearch, request: SmartRequestService) => Promise<any>)
}

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
  styleUrl: './table.component.scss'
})
export class TableComponent {
  @Input() app!: string
  @Input() page!: string;
  @Input() content!: PageContent
  @Input() params!: Params;

  data: any[] = [{id: 1, name: '测试'}];
  total: number = 1;
  loading: boolean = false;

  constructor(protected rs: SmartRequestService,
              protected route: ActivatedRoute,
              protected router: Router,
              protected ms: NzModalService,
              protected ts: Title) {
    this.page = this.route.snapshot.params['page'];
  }

  ngAfterViewInit() {
    if (this.content) {
      this.build()
    } else {
      if (this.page) this.load()
      this.route.params.subscribe(params => {
        if (this.page == params['page']) return
        this.page = params['page'];
        this.load()
      })
    }
  }

  load() {
    console.log("[table] load", this.page)
    let url = "page/" + this.page
    if (this.app) url = url + this.app + "/" + this.page
    this.rs.get(url).subscribe((res) => {
      if (res.error) return
      this.content = res
      if (this.content)
        this.ts.setTitle(this.content.title);
      this.build()
    })
  }

  build() {
    console.log("[table] build", this.page)
    if (this.content && this.content.template === "table" && typeof this.content.search_func == "string") {
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
    //默认用上次搜索
    if (!$event) $event = this.$event
    else this.$event = $event


    //搜索
    if (this.content && this.content.template === "table" && isFunction(this.content.search_func)) {
      this.loading = true
      this.content?.search_func($event, this.rs).then((res: any) => {
        this.data = res.data
        this.total = res.total || res.data.length
      }).finally(() => {
        this.loading = false
      })
    } else if (this.content && this.content.template === "table" && this.content.search_url) {
      this.loading = true
      this.rs.post(this.content.search_url, $event).subscribe(res => {
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

  execute(action: SmartAction | undefined) {
    if (!action) return

    let params = GetActionParams(action, this.params)

    switch (action.type) {
      case 'link':

        let uri = GetActionLink(action, this.params)
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
            action.script = new Function("params", "request", action.script)
          } catch (e) {
            console.error(e)
          }
        }
        if (isFunction(action.script)) {
          action.script.call(this, this.params, this.rs)
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
          action.script.call(this, params, this.rs)
        }
        break

      case 'page':
        this.router.navigate(["page", $event.action.page], {queryParams: params})
        break

      case 'dialog':
        //弹窗
        this.ms.create({
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
