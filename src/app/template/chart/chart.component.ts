import {Component, Input} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {
  GetActionLink,
  GetActionParams,
  ReplaceLinkParams,
  SmartAction
} from '../../lib/smart-table/smart-table.component';
import {SmartRequestService} from '../../lib/smart-request.service';

//echarts 相关引入
import * as echarts from 'echarts/core';
import {BarChart, GaugeChart, LineChart, PieChart, RadarChart} from 'echarts/charts';
//引入主题色
import 'echarts/theme/macarons.js';
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  TransformComponent
} from 'echarts/components';
import {LabelLayout, UniversalTransition} from 'echarts/features';
import {CanvasRenderer} from 'echarts/renderers';
import {NgxEchartsDirective, provideEchartsCore} from 'ngx-echarts';
import {EChartsOption} from 'echarts';
import {Title} from '@angular/platform-browser';
import {CompareObject} from '../form/form.component';
import {isFunction} from 'rxjs/internal/util/isFunction';
import {PageComponent, PageContent} from '../../pages/page/page.component';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {SmartToolbarComponent} from '../../lib/smart-toolbar/smart-toolbar.component';
import {NgIf} from '@angular/common';
import {SmartInfoComponent} from '../../lib/smart-info/smart-info.component';
import {NzModalService} from 'ng-zorro-antd/modal';

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  GaugeChart,
  RadarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);


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
  load_url?: string
  load_func?: string | ((event: Params, request: SmartRequestService) => Promise<any>)
}


@Component({
  selector: 'app-chart',
  imports: [
    NgxEchartsDirective,
    NzButtonComponent,
    NzCardComponent,
    NzSpinComponent,
    NzIconDirective,
    SmartToolbarComponent,
    NgIf,
  ],
  providers: [
    provideEchartsCore({echarts})
  ],
  templateUrl: './chart.component.html',
  standalone: true,
  styleUrl: './chart.component.scss'
})
export class ChartComponent {
  @Input() app!: string
  @Input() page!: string;
  @Input() content!: PageContent;
  @Input() params!: Params;

  loading = false

  //参数 EChartsOption
  chartOption: any = {}
  mergeOption: any = {} //EChartsOption
  chartTheme = 'macarons'
  chartHeight = 400;


  constructor(protected rs: SmartRequestService,
              protected route: ActivatedRoute,
              protected router: Router,
              protected ms: NzModalService,
              protected ts: Title) {
    //默认从路由中取
    this.page = route.snapshot.params['page']
    this.params = route.snapshot.queryParams;
  }

  ngAfterViewInit() {
    //如果是input传入，则是作为组件使用
    if (this.content) {
      this.build()
      this.loadData()
    } else {
      if (this.page) this.load()
      this.route.params.subscribe(params => {
        if (this.page == params['page']) return
        this.page = params['page'];
        this.load() //重新加载
      })
      this.route.queryParams.subscribe(params => {
        if (CompareObject(params, this.params)) return
        this.params = params;
        this.loadData() //重新加载
      })
    }
  }

  load() {
    console.log("[chart] load", this.page)
    let url = "page/" + this.page
    if (this.app) url = url + this.app + "/" + this.page
    this.rs.get(url).subscribe((res) => {
      if (res.error) return
      this.content = res
      if (this.content)
        this.ts.setTitle(this.content.title);
      this.build()
      this.loadData()
    })
  }

  build() {
    console.log("[chart] build", this.page, this.content)
    if (!this.content || this.content.template != "chart") return
    if (typeof this.content.load_func == "string") {
      try {
        //@ts-ignore
        this.content.load_func = new Function('params', 'request', this.content.load_func as string)
      } catch (e) {
        console.error(e)
      }
    }

    //初始化配置
    let chartOption: any = Object.assign({}, this.content.options) //应该使用 extends

    //标签
    if (this.content.legend) {
      if (!chartOption.legend)
        chartOption.legend = {}
    }
    if (this.content.tooltip) {
      if (!chartOption.tooltip)
        chartOption.tooltip = {}
    }

    //默认一组数据
    if (!chartOption.series)
      chartOption.series = [{name: '', type: this.content.type}]

    switch (this.content.type) {
      case "pie":
        break
      case "line":
      case "bar":
        if (!chartOption.xAxis)
          chartOption.xAxis = {type: 'category'}
        if (!chartOption.yAxis)
          chartOption.yAxis = {type: 'value'}
        break
      case 'radar':
        if (!chartOption.radar)
          if (this.content.radar) {
            chartOption.radar = {indicator: []}
            for (let k in this.content.radar) {
              chartOption.radar.indicator?.push({name: k, max: this.content.radar[k]})
            }
          }
        break
      case 'gauge':
        break
    }

    this.chartOption = chartOption
    console.log(this.chartOption)

    this.chartTheme = this.content.theme || "macarons"
    this.chartHeight = this.content.height || 400
  }

  loadData() {
    console.log("[chart] load data", this.page)
    if (!this.content || this.content.template != "chart") return

    //删除测试代码
    //this.update(undefined)

    if (isFunction(this.content.load_func)) {
      this.loading = true
      this.content.load_func(this.params, this.rs).then((res: any) => {
        //this.data = res;
        this.update(res)
      }).finally(() => {
        this.loading = false

      })
    } else if (this.content.load_url) {
      this.loading = true
      let url = ReplaceLinkParams(this.content.load_url, this.params);
      this.rs.get(url).subscribe(res => {
        if (res.error) return
        //this.data = res.data
        this.update(res.data)
      }).add(() => {
        this.loading = false
      })
    }
  }

  update(data: any) {
    if (!this.content || this.content.template != 'chart') return
    let merge: any = {}

    switch (this.content.type) {
      case "pie":
        // 第一列为x轴，第一行为分组
        // data = [
        //   ['', '2015'],
        //   ['一', 43.3],
        //   ['二', 83.1],
        //   ['三', 86.4],
        // ]

        merge.dataset = {source: data}
        break
      case "bar":
      case "line":
        // 第一列为x轴，第一行为分组
        // data = [
        //   ['', '2015', '2016', '2017'],
        //   ['一', 43.3, 85.8, 93.7],
        //   ['二', 83.1, 73.4, 55.1],
        //   ['三', 86.4, 65.2, 82.5],
        //   ['四', 72.4, 53.9, 39.1],
        //   ['五', 83.1, 73.4, 55.1],
        //   ['六', 86.4, 65.2, 82.5],
        //   ['日', 72.4, 53.9, 39.1],
        // ]

        merge.dataset = {source: data}

        //series 不能merge
        if (this.chartOption.series?.length != data[0].length - 1) {
          this.chartOption.series = data[0].map((item: any) => {
            //@ts-ignore
            return {type: this.content.type}
          })
          this.chartOption.series.pop()
        }
        break
      case "radar":
        //每行一条线，
        // data = [
        //   [41.1, 30.4, 65.1, 53.3, 92.1, 85.7],
        //   [86.5, 92.1, 85.7, 83.1, 92.1, 85.7],
        //   [24.1, 67.2, 79.5, 86.4, 92.1, 85.7],
        // ]
        merge.dataset = {source: data}
        break
      case "gauge":
        //只有一个值
        // data = [[15]]
        //data = 15
        merge.dataset = {source: [[data]]}
        break
    }

    this.mergeOption = merge
    console.log(this.mergeOption)
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


}
