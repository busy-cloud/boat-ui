import {Component, Input} from '@angular/core';
import {SmartInfoComponent, SmartInfoItem} from '../../lib/smart-info/smart-info.component';
import {SmartRequestService} from '../../lib/smart-request.service';
import {ActivatedRoute, Params} from '@angular/router';
import {isFunction} from 'rxjs/internal/util/isFunction';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {ReplaceLinkParams} from '../../lib/smart-table/smart-table.component';

export interface InfoPage {
  title: string
  template: 'info'
  items: SmartInfoItem[]

  load_url?: string
  load_func?: string | Function | ((params: Params, request: SmartRequestService) => Promise<any>)
}


@Component({
  selector: 'app-info',
  imports: [
    SmartInfoComponent,
    NzCardComponent,
    NzButtonComponent
  ],
  templateUrl: './info.component.html',
  standalone: true,
  styleUrl: './info.component.scss'
})
export class InfoComponent {
  @Input() content!: InfoPage;
  @Input() page!: string;

  @Input() params: Params = {}

  data: any = {id: 122, name: '张三', created: new Date()};

  constructor(protected rs: SmartRequestService, protected route: ActivatedRoute) {
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
    this.load()
  }

  load() {
    if (isFunction(this.content.load_func)) {
      this.content.load_func(this.params, this.rs).then((res: any) => {
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

}
