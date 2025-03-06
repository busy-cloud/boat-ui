import {Component, Input} from '@angular/core';
import {Params} from '@angular/router';
import {ParamSearch} from '../../lib/smart-table/smart-table.component';
import {SmartRequestService} from '../../lib/smart-request.service';

export interface ChartContent {
  template: 'chart'
  //TODO 添加chart表示
  search_url?: string
  search_func?: string | Function | ((event: ParamSearch, request: SmartRequestService) => Promise<any>)
}


@Component({
  selector: 'app-chart',
  imports: [],
  templateUrl: './chart.component.html',
  standalone: true,
  styleUrl: './chart.component.scss'
})
export class ChartComponent {
  @Input() page!: string;
  @Input() content!: any;
  @Input() params!: Params;

}
