import {Component, Input, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {SmartRequestService} from '../../lib/smart-request.service';
import {isFunction} from 'rxjs/internal/util/isFunction';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {SmartEditorComponent, SmartField} from '../../lib/smart-editor/smart-editor.component';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {
  GetActionLink,
  GetActionParams,
  ReplaceLinkParams,
  SmartAction
} from '../../lib/smart-table/smart-table.component';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {Title} from '@angular/platform-browser';
import {PageComponent, PageContent} from '../../pages/page/page.component';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {SmartToolbarComponent} from '../../lib/smart-toolbar/smart-toolbar.component';
import {NgIf} from '@angular/common';
import {NzModalService} from 'ng-zorro-antd/modal';

export interface FormContent {
  template: 'form'
  fields: SmartField[]

  load_url?: string
  load_func?: string | Function | ((params: Params, request: SmartRequestService) => Promise<any>)
  submit_url?: string
  submit_func?: string | Function | ((data: any, request: SmartRequestService) => Promise<any>)
}

export function CompareObject(obj1: any, obj2: any): any {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // 检查属性数量是否一致
  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    const val1 = obj1[key];
    const val2 = obj2[key];

    // 检查属性是否存在
    if (!(key in obj2)) {
      return false;
    }

    // 检查属性值是否相等
    if (val1 !== val2) {
      // 如果属性值不相等且都是对象，则递归比较
      if (typeof val1 === 'object' && typeof val2 === 'object' && val1 !== null && val2 !== null) {
        if (!CompareObject(val1, val2)) {
          return false;
        }
      } else {
        return false;
      }
    }
  }

  return true;
}


@Component({
  selector: 'app-form',
  imports: [
    SmartEditorComponent,
    NzCardComponent,
    NzButtonComponent,
    NzSpinComponent,
    NzIconDirective,
    SmartToolbarComponent,
    NgIf
  ],
  templateUrl: './form.component.html',
  standalone: true,
  styleUrl: './form.component.scss'
})
export class FormComponent {
  @Input() app!: string
  @Input() page!: string;
  @Input() content!: PageContent

  @Input() params: Params = {}

  @ViewChild("editor", {static: true}) editor!: SmartEditorComponent;

  data: any = {id: 122, name: '张三', created: new Date()};

  submitting = false;

  constructor(protected rs: SmartRequestService,
              protected route: ActivatedRoute,
              protected router: Router,
              protected ms: NzModalService,
              protected ts: Title,
              protected ns: NzNotificationService) {
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
    console.log("[form] load", this.page)
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
    console.log("[form] build", this.page)
    if (this.content && this.content.template === "form" && typeof this.content.load_func == "string") {
      try {
        //@ts-ignore
        this.content.load_func = new Function('params', 'request', this.content.load_func as string)
      } catch (e) {
        console.error(e)
      }
    }
    if (this.content && this.content.template === "form" && typeof this.content.submit_func == "string") {
      try {
        //@ts-ignore
        this.content.submit_func = new Function('data', 'request', this.content.submit_func as string)
      } catch (e) {
        console.error(e)
      }
    }
  }

  loadData() {
    console.log("[form] load data", this.page)
    if (this.content && this.content.template === "form" && isFunction(this.content.load_func)) {
      this.content.load_func(this.params, this.rs).then((res: any) => {
        this.data = res;
      })
    } else if (this.content && this.content.template === "form" && this.content.load_url) {
      let url = ReplaceLinkParams(this.content.load_url, this.params);
      this.rs.get(url).subscribe(res => {
        if (res.error) return
        this.data = res.data
      })
    }
  }

  submit() {
    if (this.submitting) return
    console.log("[form] submit", this.page)
    if (this.content && this.content.template === "form" && isFunction(this.content.submit_func)) {
      this.submitting = true
      this.content.submit_func(this.data, this.rs).then((res: any) => {
        //this.data = res;
        this.ns.success("提示", "提交成功")
      }).finally(()=>{
        this.submitting = false
      })
    } else if (this.content && this.content.template === "form" && this.content.submit_url) {
      this.submitting = true
      let url = ReplaceLinkParams(this.content.submit_url, this.params);
      this.rs.post(url, this.editor.value).subscribe(res => {
        if (res.error) return
        //this.data = res.data
        this.ns.success("提示", "提交成功")
      }).add(()=>{
        this.submitting = false
      })
    }
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
