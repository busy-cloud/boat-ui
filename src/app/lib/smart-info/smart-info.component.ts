import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from "@angular/common";
import {NzDescriptionsModule} from "ng-zorro-antd/descriptions";
import {NzProgressComponent} from "ng-zorro-antd/progress";
import {NzTagComponent} from "ng-zorro-antd/tag";
import {SmartAction} from '../smart-table/smart-table.component';
import {NzModalModule} from 'ng-zorro-antd/modal';


export interface SmartInfoItem {
  key: string
  type?: string
  label: string
  span?: number
  action?: SmartAction
  options?: { [p: string | number]: any }
}

@Component({
  selector: 'smart-info',
  standalone: true,
  imports: [
    CommonModule,
    NzDescriptionsModule,
    NzProgressComponent,
    NzTagComponent,
    NzModalModule,
  ],
  templateUrl: './smart-info.component.html',
  styleUrl: './smart-info.component.scss'
})
export class SmartInfoComponent {
  @Input() title: string = '';
  @Input() fields: SmartInfoItem[] = []
  @Input() value: any = {}
  @Output() action = new EventEmitter<SmartAction>();

  constructor() {
  }
}
