import {Component} from '@angular/core';
import {SmartRequestService} from '../../lib/smart-request.service';
import {ActivatedRoute, RouterOutlet} from '@angular/router';
import {TableComponent} from '../../template/table/table.component';
import {InfoComponent} from '../../template/info/info.component';
import {FormComponent} from '../../template/form/form.component';
import {ChartComponent} from '../../template/chart/chart.component';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {Title} from '@angular/platform-browser';
import {NzCardComponent} from 'ng-zorro-antd/card';

@Component({
  selector: 'app-page',
  imports: [
    TableComponent,
    InfoComponent,
    FormComponent,
    ChartComponent,
    NzSpinComponent,
    RouterOutlet,
    NzCardComponent
  ],
  templateUrl: './page.component.html',
  standalone: true,
  styleUrl: './page.component.scss'
})
export class PageComponent {
  id = ''

  page: any = {
    //template: '_loading'
    template: 'table',
    title: '用户表',

    content: {
      buttons: [
        {label: 'test'}
      ],
      columns: [
        {
          key: 'id', label: 'ID',
          link: (row: any) => `/admin/page/${row.id}`,
          query: (row: any) => {
            return {id: row.id}
          }
        },
        {key: 'name', label: '姓名', keyword: true, sortable: true},
        {key: 'disabled', label: '禁用', sortable: true},
        {key: 'created', label: '创建日期', time: true, sortable: true},
      ],
      operators: [
        {label: '编辑', link: () => '/admin/page/user/edit',}
      ],
      search_url: "api/user/search"
    }
  }

  constructor(protected rs: SmartRequestService,
              protected route: ActivatedRoute,
              protected ts: Title) {
    route.params.subscribe(params => {
      this.id = params['id'];
      this.load()
    })
  }

  load() {
    this.rs.get("page/" + this.id).subscribe((res) => {
      if (res.error) return
      this.page = res.data
      if (this.page.title)
        this.ts.setTitle(this.page.title);
    })
  }

}
