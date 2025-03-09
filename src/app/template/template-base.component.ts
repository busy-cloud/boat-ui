import {Component} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {SmartRequestService} from '../lib/smart-request.service';
import {NzModalService} from 'ng-zorro-antd/modal';
import {Title} from '@angular/platform-browser';
import {GetActionLink, GetActionParams, ReplaceLinkParams, SmartAction} from '../lib/smart-table/smart-table.component';
import {isFunction} from 'rxjs/internal/util/isFunction';
import {PageContent} from './template';
import {PageComponent} from '../page/page.component';
import {CompareObject} from '../utils';

@Component({
  selector: 'app-template',
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

  ngAfterViewInit() {
    this.init()
  }

  ngOnInit(): void {
    if (typeof this.content.mount == "string" && this.content.mount.length > 0) {
      try {
        this.content.mount = new Function(this.content.mount)
      } catch (e) {
        console.error(e)
      }
    }
    if (isFunction(this.content.mount)) {
      this.content.mount()
    }
  }

  ngOnDestroy(): void {
    if (typeof this.content.unmount == "string" && this.content.unmount.length > 0) {
      try {
        this.content.unmount = new Function(this.content.unmount)
      } catch (e) {
        console.error(e)
      }
    }
    if (isFunction(this.content.unmount)) {
      this.content.unmount()
    }
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
    console.log("[base] build")
  }

  render(data: any) {
    this.data = data
  }

  loadData() {
    console.log("[base] load data", this.page)

    //初始化数据
    if (this.content.data) {
      //this.data = this.content.data
      this.render(this.content.data)
    }

    //通过api加载数据
    if (this.content.data_api) {
      this.loading = true
      let url = ReplaceLinkParams(this.content.data_api, this.params);
      this.request.get(url).subscribe(res => {
        if (res.error) return
        //this.data = res.data
        this.render(res.data)
      }).add(() => {
        this.loading = false
      })
    }
  }


  execute(action: SmartAction, data?: any, index?: number) {
    if (!action) return

    let params = GetActionParams(action, data || this.data)

    switch (action.type) {
      case 'link':

        let uri = GetActionLink(action, data || this.data)
        let query = new URLSearchParams(params).toString()
        let url = uri + '?' + query

        if (action.external)
          window.open(url)
        else
          this.router.navigateByUrl(url)
        //this.router.navigate([uri], {queryParams: params})

        break

      case 'script':
        if (typeof action.script == "string" && action.script.length > 0) {
          try {
            action.script = new Function("data", "index", action.script)
          } catch (e) {
            console.error(e)
          }
        }
        if (isFunction(action.script)) {
          action.script.call(this, data || this.data, index)
        }
        break

      case 'page':
        this.router.navigate(["page", action.page], {queryParams: params})
        //TODO 要支持子页面

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
