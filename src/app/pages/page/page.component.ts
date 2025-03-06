import {Component} from '@angular/core';
import {SmartRequestService} from '../../lib/smart-request.service';
import {ActivatedRoute, RouterOutlet} from '@angular/router';
import {TableComponent, TablePage} from '../../template/table/table.component';
import {InfoComponent, InfoPage} from '../../template/info/info.component';
import {FormComponent, FormPage} from '../../template/form/form.component';
import {ChartComponent} from '../../template/chart/chart.component';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {NzCardComponent} from 'ng-zorro-antd/card';

type Content = TablePage | FormPage | InfoPage | { template: '_loading' } | { template: 'chart' }

export interface Page {
  name: string
  content: Content[]
}

@Component({
  selector: 'app-page',
  imports: [
    TableComponent,
    InfoComponent,
    FormComponent,
    ChartComponent,
    NzSpinComponent,
  ],
  templateUrl: './page.component.html',
  standalone: true,
  styleUrl: './page.component.scss'
})
export class PageComponent {
  id = ''

  page: Page = {
    name: '',
    content: [{
      template: 'table',
      title: '测试表',
      buttons: [{label: 'test'}],
      columns: [
        {
          key: 'id', label: 'ID',
          action: {
            type: 'link',
            link: `/admin/page/:id`,
            paramsFunc: (row: any) => {
              return {id: row.id}
            }
          }
        },
        {key: 'name', label: '姓名', keyword: true, sortable: true},
        {key: 'disabled', label: '禁用', sortable: true},
        {key: 'created', label: '创建日期', date: true, sortable: true},
      ],
      operators: [
        {
          label: '编辑', action: {
            type: 'link',
            link: '/admin/page/edit',
            external: true
          }
        }
      ],
      search_url: "api/user/search"
    },
      {
        template: 'info',
        title: '测试表',
        load_url: 'user/:id',
        items: [
          {
            key: 'id', label: 'ID',
            action: {
              type: 'link',
              link: `/admin/page/:id`,
              paramsFunc: (row: any) => {
                return {id: row.id}
              }
            }
          },
          {key: 'name', label: '姓名'},
          {key: 'disabled', label: '禁用'},
          {key: 'created', label: '创建日期', type: 'date'},
        ],
      },
      {
        template: 'form',
        title: '测试表单',
        fields: [
          {key: 'id', label: 'ID', type: "text"},
          {key: 'name', label: '姓名', type: "text"},
          {key: 'disabled', label: '禁用', type: "switch"},
          {key: 'created', label: '创建日期', type: 'date'},
        ],
      }
    ]
  }

  constructor(protected rs: SmartRequestService,
              protected route: ActivatedRoute) {
    route.params.subscribe(params => {
      this.id = params['id'];
      this.load()
    })
  }

  load() {
    this.rs.get("page/" + this.id).subscribe((res) => {
      if (res.error) return
      this.page = res.data
      // if (this.page.title)
      //   this.ts.setTitle(this.page.title);
    })
  }

}
