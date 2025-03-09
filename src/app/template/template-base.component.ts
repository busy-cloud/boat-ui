import {Component} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {SmartRequestService} from '../lib/smart-request.service';
import {NzModalService} from 'ng-zorro-antd/modal';
import {Title} from '@angular/platform-browser';
import {
  GetActionLink,
  GetActionParams,
  ReplaceLinkParams,
  SmartAction
} from '../lib/smart-table/smart-table.component';
import {isFunction} from 'rxjs/internal/util/isFunction';
import {PageContent} from './template';
import {PageComponent} from '../page/page.component';
import {CompareObject} from '../utils';

@Component({
  selector: 'app-2template',
  imports: [],
  template: '',
  standalone: true,
  inputs: ['app', 'page', 'content', 'params', 'data']
})
export class TemplateBase {
  app!: string
  page!: string;
  content!: PageContent
  params: Params = {}
  data: any = []

  loading = false

  protected constructor(protected request: SmartRequestService,
                        protected modal: NzModalService,
                        protected route: ActivatedRoute,
                        protected router: Router,
                        protected title: Title) {
    //默认从路由中取
    this.app = route.snapshot.params['app']
    this.page = route.snapshot.params['page']
    this.params = route.snapshot.queryParams;
  }

  ngAfterViewInit(){
    this.init()
  }

  init() {
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
    console.log("[base] load", this.page)
    let url = "page/" + this.page
    if (this.app) url = url + this.app + "/" + this.page
    this.request.get(url).subscribe((res) => {
      if (res.error) return
      this.content = res
      if (this.content.title)
        this.title.setTitle(this.content.title);
      this.build()
      this.loadData()
    })
  }

  //abstract build(): void
  build() {
    console.error("template build")
  }

  loadData() {
    console.log("[base] load data", this.page)

    //初始化数据
    if (this.content.data) {
      this.data = this.content.data
    }

    if (this.content.data_api) {
      this.loading = true
      let url = ReplaceLinkParams(this.content.data_api, this.params);
      this.request.get(url).subscribe(res => {
        if (res.error) return
        this.data = res.data
      }).add(() => {
        this.loading = false
      })
    }
  }


  execute(action: SmartAction | undefined) {
    if (!action) return

    let params = GetActionParams(action, this.data)

    switch (action.type) {
      case 'link':

        let uri = GetActionLink(action, this.data)
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
            action.script = new Function("data", "request", action.script)
          } catch (e) {
            console.error(e)
          }
        }
        if (isFunction(action.script)) {
          action.script.call(this, this.data, this.request)
        }
        break

      case 'page':
        this.router.navigate(["page", action.page], {queryParams: params})
        break

      case 'dialog':
        this.modal.create({
          nzContent: PageComponent,
          nzData: {
            app: action.app,
            page: action.page,
            params: params
          },
          nzFooter: null,
          //nzCloseIcon: 'close-circle',
          //nzMaskClosable: false
        })
        break

    }
  }

}
