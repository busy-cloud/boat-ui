import {Component, Input} from '@angular/core';
import {MarkdownComponent as md} from 'ngx-markdown';
import {NgIf} from '@angular/common';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {SmartToolbarComponent} from '../../lib/smart-toolbar/smart-toolbar.component';
import {PageContent} from '../../pages/page/page.component';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {SmartRequestService} from '../../lib/smart-request.service';
import {NzModalService} from 'ng-zorro-antd/modal';
import {Title} from '@angular/platform-browser';
import {CompareObject} from '../form/form.component';
import {isFunction} from 'rxjs/internal/util/isFunction';
import {ReplaceLinkParams} from '../../lib/smart-table/smart-table.component';


export interface MarkdownContent {
  template: 'markdown'
  src?: string
  src_func?: string | Function | ((params: Params, request: SmartRequestService) => Promise<any>)
}


@Component({
  selector: 'app-markdown',
  standalone: true,
  imports: [
    md,
    NzCardComponent,
    NzSpinComponent,
  ],
  templateUrl: './markdown.component.html',
  styleUrl: './markdown.component.scss'
})
export class MarkdownComponent {
  @Input() app!: string
  @Input() page!: string;
  @Input() content!: PageContent;

  @Input() params!: Params

  src = ""
  loading = false

  constructor(protected request: SmartRequestService,
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
    console.log("[markdown] load", this.page)
    let url = "page/" + this.page
    if (this.app) url = url + this.app + "/" + this.page
    this.request.get(url).subscribe((res) => {
      if (res.error) return
      this.content = res
      if (this.content)
        this.ts.setTitle(this.content.title);
      this.build()
      this.loadData()
    })
  }

  build() {
    console.log("[markdown] build", this.page)
    if (!this.content || this.content.template !== "markdown" )return
    if (typeof this.content.src_func == "string") {
      try {
        //@ts-ignore
        this.content.src_func = new Function('params', 'request', this.content.src_func as string)
      } catch (e) {
        console.error(e)
      }
    }
  }

  loadData() {
    console.log("[markdown] load data", this.page)
    if (!this.content || this.content.template !== "markdown" )return
    if (isFunction(this.content.src_func)) {
      this.loading = true
      this.content.src_func(this.params, this.request).then((res: any) => {
        this.src = res;
      }).finally(()=>{
        this.loading = false
      })
    } else if (this.content.src) {
      this.src = ReplaceLinkParams(this.content.src, this.params);
    }
  }


}
