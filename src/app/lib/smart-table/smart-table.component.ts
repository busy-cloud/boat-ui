import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NzSpaceComponent, NzSpaceItemDirective} from "ng-zorro-antd/space";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzIconDirective} from "ng-zorro-antd/icon";
import {NzInputDirective, NzInputGroupComponent} from "ng-zorro-antd/input";
import {Router} from "@angular/router";
import {NzTableFilterList, NzTableModule, NzTableQueryParams} from "ng-zorro-antd/table";
import {CommonModule} from "@angular/common";
import {NzPopconfirmDirective} from "ng-zorro-antd/popconfirm";
import {FormsModule} from '@angular/forms';
import {isFunction} from 'rxjs/internal/util/isFunction';
import {NzModalModule, NzModalService} from 'ng-zorro-antd/modal';
import {PageComponent} from '../../pages/page/page.component';
import {SmartRequestService} from '../smart-request.service';

export function ReplaceLinkParams(link: string, data: any): string {
  if (!data) return link //无参数，直接返回

  //link.matchAll(/:\w+/g)
  let match = link.match(/\:\w+/g)
  if (match != null) {
    match.forEach(m => {
      const k = m.substring(1)
      link = link.replaceAll(m, data[k])
    })
  }
  return link
}

export function GetActionLink(action: SmartAction, data: any) {
  if (!action.link) return ""

  // 先进行正则替换
  let link = ReplaceLinkParams(action.link, data)

  // 计算函数
  if (typeof action.linkFunc == "string" && action.linkFunc.length > 0) {
    try {
      action.linkFunc = new Function(action.linkFunc)
    } catch (e) {
      console.error(e)
    }
  }
  if (isFunction(action.linkFunc)) {
    link = action.linkFunc(data)
  }
  return link
}

export function GetActionParams(action: SmartAction, data: any): any {
  let params = action.params
  // 计算函数
  if (typeof action.paramsFunc == "string" && action.paramsFunc.length > 0) {
    try {
      action.paramsFunc = new Function(action.paramsFunc)
    } catch (e) {
      console.error(e)
    }
  }
  if (isFunction(action.paramsFunc)) {
    params = action.paramsFunc(data)
  }
  return params
}

export interface SmartAction {
  type: 'link' | 'script' | 'page' | 'dialog'
  link?: string
  linkFunc?: string | Function | ((data: any) => string)
  params?: any
  paramsFunc?: string | Function | ((data: any) => any)
  script?: string | Function | ((data: any) => string)
  page?: string
  dialog?: boolean
  external?: boolean
}

export interface SmartTableColumn {
  key: string
  label: string
  keyword?: boolean
  sortable?: boolean
  filter?: NzTableFilterList
  date?: boolean
  ellipsis?: boolean
  break?: boolean
  action?: SmartAction
}

export interface SmartTableOperator {
  icon?: string
  label?: string
  title?: string
  action?: SmartAction
  confirm?: string
}

export interface SmartTableButton {
  icon?: string
  label: string
  title?: string
  action?: SmartAction
}


export interface SmartTableParams {
  buttons?: SmartTableButton[];
  columns: SmartTableColumn[]
  operators: SmartTableOperator[]
}

export interface ParamSearch {
  filter: { [key: string]: any }
  skip?: number
  limit?: number
  sort?: { [key: string]: number }
  keyword?: { [key: string]: string }
}

@Component({
  selector: 'smart-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzSpaceComponent,
    NzButtonComponent,
    NzIconDirective,
    NzInputDirective,
    NzInputGroupComponent,
    NzSpaceItemDirective,
    NzTableModule,
    NzPopconfirmDirective,
    NzModalModule,
  ],
  templateUrl: './smart-table.component.html',
  styleUrl: './smart-table.component.scss'
})
export class SmartTableComponent implements OnInit {
  @Input() pageSize = 20;
  pageIndex = 1;

  keyword = '';


  @Input() buttons?: SmartTableButton[];
  @Input() columns: SmartTableColumn[] = []
  @Input() operators?: SmartTableOperator[]

  @Input() datum: any[] = [];
  @Input() total: number = 0;
  @Input() loading = false;

  //@Input() showSearch: boolean = true

  @Output() query = new EventEmitter<ParamSearch>

  body: ParamSearch = {filter: {}}

  showSearch() {
    //console.log('showSearch')
    for (let i in this.columns) {
      if (this.columns[i].keyword)
        return true
    }
    return false    //return this.columns.filter(c => c.keyword).length > 0
  }

  constructor(private router: Router, private ms: NzModalService, private rs: SmartRequestService) {
  }

  ngOnInit(): void {
  }

  refresh() {
    this.pageIndex = 1;
    //this.load();
    this.query.emit(this.body)
  }

  search() {
    //console.log(this.keyword);
    this.body.keyword = {}

    if (this.keyword) {
      this.columns.forEach(c => {
        if (c.keyword)
          // @ts-ignore
          this.body.keyword[c.key] = this.keyword
      })
    }

    this.query.emit(this.body)
  }

  execute(action: SmartAction | undefined, data: any) {
    if (!action) return

    let params = GetActionParams(action, data)

    switch (action.type) {
      case 'link':

        let uri = GetActionLink(action, data)
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
          }catch (e) {
            console.error(e)
          }
        }
        if (isFunction(action.script)) {
          //action.script(data)
          //@ts-ignore
          action.script.call(this, params, this.rs)
        }
        break

      case 'page':
        this.router.navigate(["page", action.page], {queryParams: params})
        break

      case 'dialog':
        //弹窗
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

  onQuery(query: NzTableQueryParams) {
    //console.log("table view onQuery", query)
    //过滤器
    query.filter.forEach(f => {
      if (f.value) {
        if (f.value.length > 1)
          this.body.filter[f.key] = f.value;
        else if (f.value.length === 1)
          this.body.filter[f.key] = f.value[0];
      }
    })

    //分页
    this.body.skip = (query.pageIndex - 1) * query.pageSize;
    this.body.limit = query.pageSize;

    //排序
    const sorts = query.sort.filter(s => s.value);
    if (sorts.length) {
      this.body.sort = {};
      sorts.forEach(s => {
        // @ts-ignore
        this.body.sort[s.key] = s.value === 'ascend' ? 1 : -1;
      });
    } else {
      delete this.body.sort;
    }

    this.query.emit(this.body)
  }

}
