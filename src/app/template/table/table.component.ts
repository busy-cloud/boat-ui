import {Component, Input} from '@angular/core';
import {
  ParamSearch,
  SmartTableButton,
  SmartTableColumn,
  SmartTableComponent,
  SmartTableOperator
} from '../../lib/smart-table/smart-table.component';
import {SmartRequestService} from '../../lib/smart-request.service';
import {ActivatedRoute} from '@angular/router';
import {isFunction} from 'rxjs/internal/util/isFunction';
import {NzCardComponent} from 'ng-zorro-antd/card';


export interface TablePage {
  title: string
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
    NzCardComponent
  ],
  templateUrl: './table.component.html',
  standalone: true,
  styleUrl: './table.component.scss'
})
export class TableComponent {
  @Input() content!: TablePage;
  @Input() page!: string;

  data: any[] = [{id: 1, name: '测试'}];
  total: number = 1;
  loading: boolean = false;

  constructor(protected rs: SmartRequestService, protected route: ActivatedRoute) {

  }

  ngAfterViewInit() {
    if (this.content.search_func) {
      try {
        this.content.search_func = new Function(this.content.search_func as string)
      } catch (e) {
        console.error(e);
      }
    }
    //console.log(this.content)
  }

  $event: ParamSearch = {filter:{}}

  onQuery($event: ParamSearch) {
    //默认用上次搜索
    if (!$event) $event = this.$event
    else this.$event = $event

    //搜索
    if (isFunction(this.content.search_func)) {
      this.loading = true
      this.content.search_func($event, this.rs).then((res:any) => {
        this.data = res.data
        this.total = res.total || res.data.length
      }).finally(() => {
        this.loading = false
      })
    } else if (this.content.search_url) {
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
