import {Component, Input} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {ReplaceLinkParams} from '../../lib/smart-table/smart-table.component';
import {SmartRequestService} from '../../lib/smart-request.service';

//echarts 相关引入
import * as echarts from 'echarts/core';
import {BarChart, GaugeChart, LineChart, PieChart, RadarChart} from 'echarts/charts';
//引入主题色
//import 'echarts/theme/macarons.js';
import {
  DatasetComponent,
  GridComponent,
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
import {PageContent} from '../../pages/page/page.component';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {SmartInfoComponent} from '../../lib/smart-info/smart-info.component';

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  GaugeChart,
  RadarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);


export interface ChartContent {
  template: 'chart'
  //TODO 添加chart表示
  type: 'line' | 'bar' | 'pie' | 'gauge' | 'radar'
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
    SmartInfoComponent,
  ],
  providers: [
    provideEchartsCore({echarts})
  ],
  templateUrl: './chart.component.html',
  standalone: true,
  styleUrl: './chart.component.scss'
})
export class ChartComponent {
  @Input() page!: string;
  @Input() content!: PageContent;
  @Input() params!: Params;

  loading = false

  //参数
  chartOption: EChartsOption = {}
  mergeOption: EChartsOption = {}


  constructor(protected rs: SmartRequestService,
              protected route: ActivatedRoute,
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
    this.rs.get("page/" + this.page).subscribe((res) => {
      if (res.error) return
      this.content = res.data
      if (this.content)
        this.ts.setTitle(this.content.title);
      this.build()
      this.loadData()
    })
  }

  build() {
    console.log("[chart] build", this.page)
    if (this.content && this.content.template === "chart" && typeof this.content.load_func == "string") {
      try {
        //@ts-ignore
        this.content.load_func = new Function('params', 'request', this.content.load_func as string)
      } catch (e) {
        console.error(e)
      }
    }
  }

  loadData() {
    console.log("[chart] load data", this.page)
    this.update(undefined)

    if (this.content && this.content.template === "chart" && isFunction(this.content.load_func)) {
      this.loading = true
      this.content.load_func(this.params, this.rs).then((res: any) => {
        //this.data = res;
        this.update(res)
      }).finally(()=>{
        this.loading = false
      })
    } else if (this.content && this.content.template === "chart" && this.content.load_url) {
      this.loading = true
      let url = ReplaceLinkParams(this.content.load_url, this.params);
      this.rs.get(url).subscribe(res => {
        if (res.error) return
        //this.data = res.data
        this.update(res.data)
      }).add(()=>{
        this.loading = false
      })
    }
  }

  update(data: any) {
    if (!this.content || this.content.template != 'chart') return
    switch (this.content.type) {
      case "bar":
        break
      case "pie":
        break
      case "line":
        this.mergeOption = {
          xAxis: {type: 'category', data: ['1', '2', '3', '4', '5', '6', '7', '8', '9']},
          yAxis: {type: 'value'},
          series: [
            {type: 'line', data: [34,2,23,3,2,34,234,234,235,]}
          ]
        }
        break
      case "gauge":
        break
      case "radar":
        break
    }
  }

}
