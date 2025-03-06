import {Component, Input} from '@angular/core';
import {
  ParamSearch,
  SmartTableButton,
  SmartTableColumn,
  SmartTableComponent,
  SmartTableOperator
} from '../../lib/smart-table/smart-table.component';
import {SmartRequestService} from '../../lib/smart-request.service';
import {ActivatedRoute, Params} from '@angular/router';
import {isFunction} from 'rxjs/internal/util/isFunction';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {Title} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {PageContent} from '../../pages/page/page.component';


export interface TableContent {
  template: 'table'
  buttons?: SmartTableButton[]
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
  ],
  templateUrl: './table.component.html',
  standalone: true,
  styleUrl: './table.component.scss'
})
export class TableComponent {

  @Input() page!: string;
  @Input() content!: PageContent
  @Input() params!: Params;

  data: any[] = [{id: 1, name: '测试'}];
  total: number = 1;
  loading: boolean = false;

  constructor(protected rs: SmartRequestService,
              protected route: ActivatedRoute,
              protected ts: Title) {
    this.page = this.route.snapshot.params['page'];
  }

  ngAfterViewInit() {
    if (this.content) {
      this.build()
    } else {
      if (this.page) this.load()
      this.route.params.subscribe(params => {
        this.page = params['page'];
        this.load()
      })
    }
  }

  load() {
    this.rs.get("page/" + this.page).subscribe((res) => {
      if (res.error) return
      this.content = res.data
      if (this.content)
        this.ts.setTitle(this.content.title);
      this.build()
    })
  }

  build() {
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

  onQuery($event: ParamSearch) {
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


}
