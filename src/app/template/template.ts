import {SmartField} from '../lib/smart-editor/smart-editor.component';
import {EChartsOption} from 'echarts';
import {Params} from '@angular/router';
import {SmartRequestService} from '../lib/smart-request.service';
import {SmartInfoItem} from '../lib/smart-info/smart-info.component';
import {ParamSearch, SmartTableColumn, SmartTableOperator} from '../lib/smart-table/smart-table.component';


export type PageContent = Content & (
  TableContent |
  FormContent |
  InfoContent |
  ChartContent |
  MarkdownContent |
  AmapContent)

export interface Content {
  page?: string //暂时无用

  title?: string

  data?: any //初始化数据
  data_api?: string //数据接口

  //作为子页面时的参数（无用）
  params?: any
  params_func?: string | ((data: any) => any)

  toolbar?: SmartField[] //工具栏

  span: string | number | null //占用宽度 总数24
  height?: number | string //高度

  mount?: string | (() => void)
  unmount?: string | (() => void)

  children?: PageContent[]
}

export interface AmapContent {
  template: 'amap'

  key?: string
  secret?: string
  style?: string
  zoom?: number
  city?: number
}

export interface ChartContent {
  template: 'chart'
  type: 'line' | 'bar' | 'pie' | 'gauge' | 'radar'
  //title: string;
  theme?: string
  height?: number
  legend?: boolean
  tooltip?: boolean
  time?: boolean
  radar?: { [key: string]: number }
  options: EChartsOption
}

export interface FormContent {
  template: 'form'
  fields: SmartField[]

  load_url?: string
  load_func?: string | Function | ((params: Params, request: SmartRequestService) => Promise<any>)
  submit_url?: string
  submit_func?: string | Function | ((data: any, request: SmartRequestService) => Promise<any>)
}

export interface InfoContent {
  template: 'info'
  items: SmartInfoItem[]

  load_url?: string
  load_func?: string | Function | ((params: Params, request: SmartRequestService) => Promise<any>)
}

export interface MarkdownContent {
  template: 'markdown'
  src?: string
  src_func?: string | Function | ((params: Params, request: SmartRequestService) => Promise<any>)
}

export interface TableContent {
  template: 'table'
  columns: SmartTableColumn[]
  operators: SmartTableOperator[]
  search_url?: string
  search_func?: string | Function | ((event: ParamSearch, request: SmartRequestService) => Promise<any>)
}
