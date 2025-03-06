import {Component, Input, ViewChild} from '@angular/core';
import {SmartInfoItem} from '../../lib/smart-info/smart-info.component';
import {ActivatedRoute, Params} from '@angular/router';
import {SmartRequestService} from '../../lib/smart-request.service';
import {isFunction} from 'rxjs/internal/util/isFunction';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {SmartEditorComponent, SmartField} from '../../lib/smart-editor/smart-editor.component';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {GetActionLink, ReplaceLinkParams} from '../../lib/smart-table/smart-table.component';


export interface FormPage {
  title: string
  template: 'form'
  fields: SmartField[]

  load_url?: string
  load_func?: string | Function | ((params: Params, request: SmartRequestService) => Promise<any>)
  submit_url?: string
  submit_func?: string | Function | ((data: any, request: SmartRequestService) => Promise<any>)
}


@Component({
  selector: 'app-form',
  imports: [
    SmartEditorComponent,
    NzCardComponent,
    NzButtonComponent
  ],
  templateUrl: './form.component.html',
  standalone: true,
  styleUrl: './form.component.scss'
})
export class FormComponent {
  @Input() content!: FormPage;
  @Input() page!: string;

  @Input() params: Params = {}

  @ViewChild("editor", {static: true}) editor!: SmartEditorComponent;

  data: any = {id: 122, name: '张三', created: new Date()};

  constructor(protected rs: SmartRequestService, protected route: ActivatedRoute, protected ns: NzNotificationService) {
    route.queryParams.subscribe(res => {
      this.params = res;
      this.load() //重新加载
    })
  }

  ngAfterViewInit() {
    if (this.content.load_func) {
      try {
        this.content.load_func = new Function('params', 'request', this.content.load_func as string)
      } catch (e) {
        console.error(e)
      }
    }
    if (this.content.submit_func) {
      try {
        this.content.submit_func = new Function('data', 'request', this.content.submit_func as string)
      } catch (e) {
        console.error(e)
      }
    }
    this.load()
  }

  load() {
    if (isFunction(this.content.load_func)) {
      this.content.load_func(this.params, this.rs).then((res:any) => {
        this.data = res;
      })
    } else if (this.content.load_url) {
      let url = ReplaceLinkParams(this.content.load_url, this.params);
      this.rs.get(url).subscribe(res => {
        if (res.error) return
        this.data = res.data
      })
    }
  }

  submit() {
    if (isFunction(this.content.submit_func)) {
      this.content.submit_func(this.data, this.rs).then((res:any) => {
        //this.data = res;
        this.ns.success("提示", "提交成功")
      })
    } else if (this.content.submit_url) {
      let url = ReplaceLinkParams(this.content.submit_url, this.params);
      this.rs.post(url, this.editor.value).subscribe(res => {
        if (res.error) return
        //this.data = res.data
        this.ns.success("提示", "提交成功")
      })
    }
  }


}
