import {Component, Input, ViewChild} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {SmartRequestService} from '../../lib/smart-request.service';
import {isFunction} from 'rxjs/internal/util/isFunction';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {SmartEditorComponent, SmartField} from '../../lib/smart-editor/smart-editor.component';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {ReplaceLinkParams} from '../../lib/smart-table/smart-table.component';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {Title} from '@angular/platform-browser';
import {PageContent} from '../../pages/page/page.component';

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
    NzSpinComponent
  ],
  templateUrl: './form.component.html',
  standalone: true,
  styleUrl: './form.component.scss'
})
export class FormComponent {
  @Input() page!: string;
  @Input() content!: PageContent

  @Input() params: Params = {}

  @ViewChild("editor", {static: true}) editor!: SmartEditorComponent;

  data: any = {id: 122, name: '张三', created: new Date()};

  constructor(protected rs: SmartRequestService,
              protected route: ActivatedRoute,
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
    console.log("[form] submit", this.page)
    if (this.content && this.content.template === "form" && isFunction(this.content.submit_func)) {
      this.content.submit_func(this.data, this.rs).then((res: any) => {
        //this.data = res;
        this.ns.success("提示", "提交成功")
      })
    } else if (this.content && this.content.template === "form" && this.content.submit_url) {
      let url = ReplaceLinkParams(this.content.submit_url, this.params);
      this.rs.post(url, this.editor.value).subscribe(res => {
        if (res.error) return
        //this.data = res.data
        this.ns.success("提示", "提交成功")
      })
    }
  }


}
