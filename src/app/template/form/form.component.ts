import {Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SmartRequestService} from '../../lib/smart-request.service';
import {isFunction} from 'rxjs/internal/util/isFunction';
import {SmartEditorComponent} from '../../lib/smart-editor/smart-editor.component';
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
import {FormContent} from '../template';


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
export class FormComponent extends TemplateBase {

  @ViewChild("editor", {static: true}) editor!: SmartEditorComponent;

  submitting = false;

  constructor(request: SmartRequestService, modal: NzModalService, route: ActivatedRoute, router: Router, title: Title) {
    super(request, modal, route, router, title)
  }

  submit() {
    if (this.submitting) return
    console.log("[form] submit", this.page)
    const content = this.content as FormContent
    if (!content) return

    if (typeof content.submit == "string" && content.submit.length > 0) {
      try {
        content.submit = new Function("data", "request", content.submit)
      } catch (e) {
        console.error(e)
      }
    }
    if (isFunction(content.submit)) {
      this.submitting = true
      content.submit(this.data, this.request).then((res: any) => {
        //this.data = res;
        //this.ns.success("提示", "提交成功")
      }).finally(() => {
        this.submitting = false
      })
    } else if (content.submit_api) {
      this.submitting = true
      let url = ReplaceLinkParams(content.submit_api, this.params);
      this.request.post(url, this.editor.value).subscribe(res => {
        if (res.error) return
        //this.data = res.data
        //this.ns.success("提示", "提交成功")
      }).add(() => {
        this.submitting = false
      })
    }
  }


}
