import {Component, Input} from '@angular/core';
import {SmartInfoComponent, SmartInfoItem} from '../../lib/smart-info/smart-info.component';
import {SmartTableButton, SmartTableColumn, SmartTableOperator} from '../../lib/smart-table/smart-table.component';
import {SmartRequestService} from '../../lib/smart-request.service';
import {ActivatedRoute} from '@angular/router';

export interface InfoPage {
  items?: SmartInfoItem[]
  load_url?: string
  load_action?: string | any
}


@Component({
  selector: 'app-info',
  imports: [
    SmartInfoComponent
  ],
  templateUrl: './info.component.html',
  standalone: true,
  styleUrl: './info.component.scss'
})
export class InfoComponent {
  @Input() content!: InfoPage;
  @Input() page!: string;

  data: any = {id:122, name: '张三', created: new Date()};


  constructor(protected rs: SmartRequestService, protected route: ActivatedRoute) {

  }

  ngAfterViewInit() {
    if (this.content.load_action) {
      this.content.load_action = new Function(this.content.load_action)
    }
    this.load()
  }

  load() {
    if (this.content.load_action) {
      this.content.load_action = new Function(this.content.load_action)
      this.content.load_action()
    } else if (this.content.load_url) {
      this.rs.get(this.content.load_url).subscribe(res=>{
        if (res.error) return
        this.data = res.data
      })
    }
  }


}
