import {Component} from '@angular/core';
import {MarkdownComponent as md} from 'ngx-markdown';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {ActivatedRoute, Router} from '@angular/router';
import {SmartRequestService} from '../../lib/smart-request.service';
import {NzModalService} from 'ng-zorro-antd/modal';
import {Title} from '@angular/platform-browser';
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
export class MarkdownComponent extends TemplateBase {
  constructor(request: SmartRequestService, modal: NzModalService, route: ActivatedRoute, router: Router, title: Title) {
    super(request, modal, route, router, title)
  }
}
