import {Component} from '@angular/core';
import {MarkdownComponent as md} from 'ngx-markdown';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {SmartRequestService} from '../../lib/smart-request.service';
import {NzModalService} from 'ng-zorro-antd/modal';
import {Title} from '@angular/platform-browser';
import {isFunction} from 'rxjs/internal/util/isFunction';
import {ReplaceLinkParams} from '../../lib/smart-table/smart-table.component';
import {TemplateBase} from '../template-base.component';


@Component({
  selector: 'app-markdown',
  standalone: true,
  imports: [
    md,
    NzCardComponent,
    NzSpinComponent,
  ],
  templateUrl: './markdown.component.html',
  styleUrl: './markdown.component.scss',
  inputs: ['app', 'page', 'content', 'params', 'data']
})
export class MarkdownComponent extends TemplateBase{

  src = ""

  constructor(request: SmartRequestService, modal: NzModalService, route: ActivatedRoute, router: Router, title: Title) {
    super(request, modal, route, router, title)
  }

  override build() {
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

  override loadData() {
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
