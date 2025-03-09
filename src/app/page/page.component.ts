import {Component, inject, Input} from '@angular/core';
import {SmartRequestService} from '../lib/smart-request.service';
import {ActivatedRoute, Params} from '@angular/router';
import {TableComponent} from '../template/table/table.component';
import {InfoComponent} from '../template/info/info.component';
import {FormComponent} from '../template/form/form.component';
import {ChartComponent} from '../template/chart/chart.component';
import {AmapComponent} from '../template/amap/amap.component';
import {MarkdownComponent} from '../template/markdown/markdown.component';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {Title} from '@angular/platform-browser';
import {isFunction} from 'rxjs/internal/util/isFunction';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NZ_MODAL_DATA} from 'ng-zorro-antd/modal';
import {PageContent} from '../template/template';
import {StatisticComponent} from '../template/statistic/statistic.component';

@Component({
  selector: 'app-page',
  imports: [
    TableComponent,
    InfoComponent,
    FormComponent,
    ChartComponent,
    NzSpinComponent,
    NzRowDirective,
    NzColDirective,
    AmapComponent,
    MarkdownComponent,
    StatisticComponent,
  ],
  templateUrl: './page.component.html',
  standalone: true,
  styleUrl: './page.component.scss',
})
export class PageComponent {
  @Input() app!: string
  @Input() page!: string
  @Input() content!: PageContent
  @Input() params!: Params
  @Input() isChild = false

  nzModalData: any = inject(NZ_MODAL_DATA, {optional: true});

  constructor(protected request: SmartRequestService,
              protected route: ActivatedRoute,
              protected title: Title,
              //@Optional() protected nzModalData: NZ_MODAL_DATA
  ) {
    //优先使用弹窗参数
    if (this.nzModalData) {
      this.app = this.nzModalData.app;
      this.page = this.nzModalData.page;
      this.params = this.nzModalData.params;
    } else {
      this.app = route.snapshot.params['app'];
      this.page = route.snapshot.params['page'];
      this.params = route.snapshot.queryParams;
    }
  }

  ngAfterViewInit(): void {
    if (this.content) {
      //this.ts.setTitle(this.content.title);
      this.build()
    } else {
      if (this.page) this.load()
      //弹窗之外，需要监听路由参数
      if (!this.nzModalData) {
        this.route.params.subscribe(params => {
          if (this.app == params['app'] && this.page == params['page']) return
          this.app = params['app'];
          this.page = params['page'];
          this.load()
        })
        this.route.queryParams.subscribe(params => {
          this.params = params;
          //this.load()
        })
      }
    }
  }

  load() {
    console.log("[page] load", this.app, this.page)

    //@ts-ignore
    //this.content = undefined //清空页面

    let url = "page/" + this.page
    if (this.app) url = url + this.app + "/" + this.page
    this.request.get(url).subscribe((res) => {
      if (res.error) return
      this.content = res
      if (this.content.title)
        this.title.setTitle(this.content.title);
      this.build()
    })
  }

  build() {
    console.log("[page] build", this.app, this.page)
    this.content?.children?.forEach(c => {
      if (typeof c.params_func == "string") {
        try {
          //@ts-ignore
          c.params_func = new Function('params', c.params_func as string)
        } catch (e) {
          console.error(e)
        }
      }
      if (isFunction(c.params_func)) {
        c.params = c.params_func(this.params)
      }
    })
  }

}
