import {Component} from '@angular/core';
import {SmartInfoComponent} from '../../lib/smart-info/smart-info.component';
import {SmartRequestService} from '../../lib/smart-request.service';
import {ActivatedRoute, Router} from '@angular/router';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {Title} from '@angular/platform-browser';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzModalService} from 'ng-zorro-antd/modal';
import {SmartToolbarComponent} from '../../lib/smart-toolbar/smart-toolbar.component';
import {NgIf} from '@angular/common';
import {TemplateBase} from '../template-base.component';


@Component({
  selector: 'app-info',
  imports: [
    SmartInfoComponent,
    NzCardComponent,
    NzButtonComponent,
    NzSpinComponent,
    NzIconDirective,
    SmartToolbarComponent,
    NgIf
  ],
  templateUrl: './info.component.html',
  standalone: true,
  styleUrl: './info.component.scss',
  inputs: ['app', 'page', 'content', 'params', 'data']
})
export class InfoComponent extends TemplateBase {

  constructor(request: SmartRequestService, modal: NzModalService, route: ActivatedRoute, router: Router, title: Title) {
    super(request, modal, route, router, title)
  }

}
