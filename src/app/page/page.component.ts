import {Component, inject, Input} from '@angular/core';
import {SmartRequestService} from '../lib/smart-request.service';
import {ActivatedRoute, Params, RouterLink} from '@angular/router';
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
import {ChildPage, PageContent, TabPage} from '../template/template';
import {StatisticComponent} from '../template/statistic/statistic.component';
import {ObjectDeepCompare} from '../lib/utils';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzResultComponent} from 'ng-zorro-antd/result';
import {NzTabComponent, NzTabDirective, NzTabSetComponent} from 'ng-zorro-antd/tabs';
import {ImportComponent} from '../template/import/import.component';

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
    NzButtonComponent,
    NzResultComponent,
    RouterLink,
    NzTabSetComponent,
    NzTabComponent,
    NzTabDirective,
    ImportComponent,
  ],
  templateUrl: './page.component.html',
  standalone: true,
  styleUrl: './page.component.scss',
})
export class PageComponent {
  @Input() app?: string
  @Input() page?: string
  @Input() content?: PageContent
  @Input() params?: Params
  @Input() isChild = false

  error = ''

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
      if (this.page) this.load_page()
      //弹窗之外，需要监听路由参数
      if (!this.nzModalData && !this.isChild) {
        this.route.params.subscribe(params => {
          if (this.app == params['app'] && this.page == params['page']) return

          console.log("[page] page change")

          this.app = params['app'];
          this.page = params['page'];
          this.load_page()

          this.content = undefined
        })
        this.route.queryParams.subscribe(params => {
          if (ObjectDeepCompare(params, this.params)) return

          console.log("[page] query change")

          this.params = params;

          //this.load()
          this.load_page()
          this.content = undefined
        })
      }
    }
  }

  load_page() {
    console.log("[page] loadPage", this.app, this.page)
    this.error = ''

    //@ts-ignore
    //this.content = undefined //清空页面

    let url = "page/" + this.page
    if (this.app)
      url = "page/" + this.app + "/" + this.page
    this.request.get(url).subscribe((res) => {
      if (res.error) {
        //console.log("load page error", res.error)
        this.error = res.error
        return
      }
      this.content = res
      if (this.content?.title && !this.isChild)
        this.title.setTitle(this.content.title);
      this.build()
    }, (error) => {
      this.error = error
    })
  }

  // calc_params(c: ChildPage | TabPage): any {
  //   //这里会反复地调用， 所以缓存一下
  //   if (c.params) return c.params;
  //
  //   console.log("calc_params", c, this)
  //
  //   if (isFunction(c.params_func)) {
  //     try {
  //       //@ts-ignore
  //       c.params = c.params_func.call(this, this.params)
  //     } catch (e) {
  //       console.error(e)
  //       c.params = {}
  //     }
  //   }
  //
  //   if (!c.params) {
  //     c.params = this.params
  //   }
  //
  //   return c.params
  // }

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

      //是不是算的有点早了。。。
      if (isFunction(c.params_func)) {
        c.params = c.params_func(this.params)
      }
    })

    this.content?.tabs?.forEach(c => {
      if (typeof c.params_func == "string") {
        try {
          //@ts-ignore
          c.params_func = new Function('params', c.params_func as string)
        } catch (e) {
          console.error(e)
        }
      }

      //是不是算的有点早了。。。
      if (isFunction(c.params_func)) {
        c.params = c.params_func(this.params)
      }
    })
  }

}
