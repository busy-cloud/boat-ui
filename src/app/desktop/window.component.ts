import {Component, EventEmitter, Input, OnInit, Output,} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {CdkDrag, CdkDragHandle} from '@angular/cdk/drag-drop';
import {NzSpaceComponent, NzSpaceItemDirective} from 'ng-zorro-antd/space';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzTabComponent, NzTabSetComponent} from 'ng-zorro-antd/tabs';
import {FullscreenDirective} from '../fullscreen.directive';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss'],
  imports: [
    NgStyle,
    CdkDrag,
    CdkDragHandle,
    NzSpaceComponent,
    NzSpaceItemDirective,
    NzButtonComponent,
    NzIconDirective,
    NzTabSetComponent,
    NgIf,
    NzTabComponent,
    NgForOf,
    FullscreenDirective
  ],
  standalone: true
})
export class WindowComponent implements OnInit {
  // index = 0;
  @Input() index: any;
  @Input() title: any;
  @Input() show: any;

  _url: SafeResourceUrl;

  width: any = '60vw';
  height: any = '50vh';

  dragPosition = {x: 0, y: 0};

  dynamic = false;
  items: any[] = [];

  @Output() onClose = new EventEmitter();
  @Output() onHide = new EventEmitter();
  @Output() setIndex = new EventEmitter();


  constructor(private msg: NzMessageService, private san: DomSanitizer) {
  }

  ngOnInit(): void {
  }

  tabData: any;

  zindex() {
    this.setIndex.emit(this.title);
  }

  @Input() set url(url: string) {
      this._url = this.san.bypassSecurityTrustResourceUrl(url);
  }

  close() {
    this.onClose.emit(this.title);
    this.width = '60vw';
    this.height = '50vh';
  }

  minimize() {
    this.onHide.emit(this.title);
  }

  showTab() {
  }

  maximize() {
    this.dynamic = !this.dynamic;
    this.dragPosition = {x: 0, y: 0};

    if (this.dynamic) {
      this.width = '100vw';
      this.height = '100vh';
    } else {
      this.width = '60vw';
      this.height = '50vh';
    }
  }
}
