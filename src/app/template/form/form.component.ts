import {Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {SmartRequestService} from '../../lib/smart-request.service';
import {isFunction} from 'rxjs/internal/util/isFunction';
import {SmartEditorComponent, SmartField} from '../../lib/smart-editor/smart-editor.component';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {ReplaceLinkParams} from '../../lib/smart-table/smart-table.component';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {Title} from '@angular/platform-browser';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {SmartToolbarComponent} from '../../lib/smart-toolbar/smart-toolbar.component';
import {NgIf} from '@angular/common';
import {NzModalService} from 'ng-zorro-antd/modal';
import {TemplateBase} from '../template-base.component';


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
  styleUrl: './form.component.scss',
  inputs: ['app', 'page', 'content', 'params', 'data']
})
export class FormComponent extends TemplateBase{

  @ViewChild("editor", {static: true}) editor!: SmartEditorComponent;

  submitting = false;

  constructor(request: SmartRequestService, modal: NzModalService, route: ActivatedRoute, router: Router, title: Title) {
    super(request, modal, route, router, title)
  }

  override build() {
    console.log("[form] build", this.page)
    if (!this.content || this.content.template !== "form") return
    if (typeof this.content.load_func == "string") {
      try {
        //@ts-ignore
        this.content.load_func = new Function('params', 'request', this.content.load_func as string)
      } catch (e) {
        console.error(e)
      }
    }
    if (typeof this.content.submit_func == "string") {
      try {
        //@ts-ignore
        this.content.submit_func = new Function('data', 'request', this.content.submit_func as string)
      } catch (e) {
        console.error(e)
      }
    }
  }

  submit() {
    if (this.submitting) return
    console.log("[form] submit", this.page)
    if (!this.content || this.content.template !== "form" )return
    if (isFunction(this.content.submit_func)) {
      this.submitting = true
      this.content.submit_func(this.data, this.request).then((res: any) => {
        //this.data = res;
        //this.ns.success("提示", "提交成功")
      }).finally(()=>{
        this.submitting = false
      })
    } else if (this.content.submit_url) {
      this.submitting = true
      let url = ReplaceLinkParams(this.content.submit_url, this.params);
      this.request.post(url, this.editor.value).subscribe(res => {
        if (res.error) return
        //this.data = res.data
        //this.ns.success("提示", "提交成功")
      }).add(()=>{
        this.submitting = false
      })
    }
  }


}
