import {Component, Input} from '@angular/core';
import {SmartRequestService} from '../../lib/smart-request.service';
import {ActivatedRoute, Params, RouterOutlet} from '@angular/router';
import {TableComponent, TableContent} from '../../template/table/table.component';
import {InfoComponent, InfoContent} from '../../template/info/info.component';
import {FormComponent, FormContent} from '../../template/form/form.component';
import {ChartComponent, ChartContent} from '../../template/chart/chart.component';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {Title} from '@angular/platform-browser';
import {isFunction} from 'rxjs/internal/util/isFunction';

export type PageContent = Content & (TableContent | FormContent | InfoContent | ChartContent)

export interface Content {
  id: string
  title: string
  params: any
  params_func?: string | ((data: any) => any)
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
  ],
  templateUrl: './page.component.html',
  standalone: true,
  styleUrl: './page.component.scss'
})
export class PageComponent {
  @Input() page!: string
  @Input() content!: PageContent
  @Input() params!: Params

  constructor(protected rs: SmartRequestService,
              protected route: ActivatedRoute,
              protected ts: Title,
  ) {
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
        if (this.page == params['page']) return
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
    console.log("[page] load", this.page)
    this.rs.get("page/" + this.page).subscribe((res) => {
      if (res.error) return
      this.content = res.data
      if (this.content.title)
        this.ts.setTitle(this.content.title);
      this.build()
    })
  }

  build() {
    console.log("[page] build", this.page)
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
