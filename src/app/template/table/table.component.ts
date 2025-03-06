import {Component, Input} from '@angular/core';
import {SmartEditorComponent} from '../../lib/smart-editor/smart-editor.component';
import {
  ParamSearch,
  SmartTableButton,
  SmartTableColumn,
  SmartTableComponent,
  SmartTableOperator
} from '../../lib/smart-table/smart-table.component';
import {SmartRequestService} from '../../lib/smart-request.service';
import {ActivatedRoute} from '@angular/router';


export interface TablePage {
  buttons?: SmartTableButton[]
  columns: SmartTableColumn[]
  operators: SmartTableOperator[]
  search_url?: string
  search_action?: string | any
}

@Component({
  selector: 'app-table',
  imports: [
    SmartEditorComponent,
    SmartTableComponent
  ],
  templateUrl: './table.component.html',
  standalone: true,
  styleUrl: './table.component.scss'
})
export class TableComponent {
  @Input() content!: TablePage;
  @Input() page!: string;

  data: any[] = [{id: 1, name: '测试'}];
  total: number = 1;
  loading: boolean = false;

  constructor(protected rs: SmartRequestService, protected route: ActivatedRoute) {

  }

  ngAfterViewInit() {
    if (this.content.search_action) {
      this.content.search_action = new Function(this.content.search_action)
    }
    //console.log(this.content)
  }

  onQuery($event: ParamSearch) {
    if (this.content.search_action) {
      this.content.search_action($event)
    } else if (this.content.search_url) {
      this.loading = true
      this.rs.post(this.content.search_url, $event).subscribe(res => {
        if (res.error) return
        this.data = res.data
        this.total = res.total || res.data.length
      }).add(() => {
        this.loading = false
      })
    }
  }


}
