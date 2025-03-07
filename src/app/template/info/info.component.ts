import {Component, Input} from '@angular/core';
import {SmartInfoComponent, SmartInfoItem} from '../../lib/smart-info/smart-info.component';
import {SmartRequestService} from '../../lib/smart-request.service';
import {ActivatedRoute, Params} from '@angular/router';
import {isFunction} from 'rxjs/internal/util/isFunction';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {Title} from '@angular/platform-browser';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {ReplaceLinkParams} from '../../lib/smart-table/smart-table.component';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {PageContent} from '../../pages/page/page.component';
import {CompareObject} from '../form/form.component';
import {NzIconDirective} from 'ng-zorro-antd/icon';

export interface InfoContent {
  template: 'info'
  items: SmartInfoItem[]

  load_url?: string
  load_func?: string | Function | ((params: Params, request: SmartRequestService) => Promise<any>)
}


@Component({
  selector: 'app-info',
  imports: [
    SmartInfoComponent,
    NzCardComponent,
    NzButtonComponent,
    NzSpinComponent,
    NzIconDirective
  ],
  templateUrl: './info.component.html',
  standalone: true,
  styleUrl: './info.component.scss'
})
export class InfoComponent {
  @Input() content!: PageContent;
  @Input() page!: string;

  @Input() params!: Params

  data: any = {id: 122, name: '张三', created: new Date()};
  loading = false

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
    console.log("[info] load", this.page)
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
    console.log("[info] build", this.page)
    if (this.content && this.content.template === "info" && typeof this.content.load_func == "string") {
      try {
        //@ts-ignore
        this.content.load_func = new Function('params', 'request', this.content.load_func as string)
      } catch (e) {
        console.error(e)
      }
    }
  }

  loadData() {
    console.log("[info] load data", this.page)
    if (this.content && this.content.template === "info" && isFunction(this.content.load_func)) {
      this.loading = true
      this.content.load_func(this.params, this.rs).then((res: any) => {
        this.data = res;
      }).finally(()=>{
        this.loading = false
      })
    } else if (this.content && this.content.template === "info" && this.content.load_url) {
      this.loading = true
      let url = ReplaceLinkParams(this.content.load_url, this.params);
      this.rs.get(url).subscribe(res => {
        if (res.error) return
        this.data = res.data
      }).add(()=>{
        this.loading = false
      })
    }
  }

}
