import {Component, Input} from '@angular/core';
import {SmartRequestService} from '../../lib/smart-request.service';
import {ActivatedRoute, Params} from '@angular/router';
import {TableComponent, TableContent} from '../../template/table/table.component';
import {InfoComponent, InfoContent} from '../../template/info/info.component';
import {FormComponent, FormContent} from '../../template/form/form.component';
import {ChartComponent, ChartContent} from '../../template/chart/chart.component';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {Title} from '@angular/platform-browser';
import {isFunction} from 'rxjs/internal/util/isFunction';
import {SmartField} from '../../lib/smart-editor/smart-editor.component';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {MarkdownContent} from '../../template/markdown/markdown.component';

export type PageContent = Content & (TableContent | FormContent | InfoContent | ChartContent | MarkdownContent)

export interface Content {
  id: string
  title: string
  params?: any
  params_func?: string | ((data: any) => any)
  toolbar?: SmartField[]
  span: string|number|null //占用宽度 总数24

  children?: PageContent[]
}

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

  constructor(protected request: SmartRequestService,
              protected route: ActivatedRoute,
              protected title: Title,
  ) {
    this.app = this.route.snapshot.params['app'];
    this.page = this.route.snapshot.params['page'];
    this.params = route.snapshot.queryParams;
  }

  ngAfterViewInit(): void {
    if (this.content) {
      //this.ts.setTitle(this.content.title);
      this.build()
    } else {
      if (this.page) this.load()
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
    })
  }

  childrenParams(child: PageContent): any {
    if (isFunction(child.params_func)) {
      return child.params_func(this.params)
    }
    return child.params
  }

}
