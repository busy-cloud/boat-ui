import {Routes} from '@angular/router';
import {SettingComponent} from '../setting/setting.component';
import {AdminComponent} from './admin.component';
import {DashComponent} from '../dash/dash.component';
import {PageComponent} from '../page/page.component';
import {TableComponent} from '../template/table/table.component';
import {FormComponent} from '../template/form/form.component';
import {InfoComponent} from '../template/info/info.component';
import {ChartComponent} from '../template/chart/chart.component';
import {UnknownComponent} from '../lib/unknown/unknown.component';


export const routes: Routes = [
  {
    path: '', component: AdminComponent, children: [
      {path: '', pathMatch: 'full', redirectTo: 'dash'},
      {path: 'dash', component: DashComponent},
      {path: 'page/:page', component: PageComponent},
      {path: 'table/:page', component: TableComponent},
      {path: 'form/:page', component: FormComponent},
      {path: 'info/:page', component: InfoComponent},
      {path: 'chart/:page', component: ChartComponent},
      {path: 'setting/:module', component: SettingComponent},
      {path: '**', component: UnknownComponent},
    ]
  },
];
