import {Routes} from '@angular/router';
import {SettingComponent} from '../pages/setting/setting.component';
import {AdminComponent} from './admin.component';
import {DashComponent} from '../pages/dash/dash.component';
import {PageComponent} from '../pages/page/page.component';
import {TableComponent} from '../template/table/table.component';
import {FormComponent} from '../template/form/form.component';
import {InfoComponent} from '../template/info/info.component';


export const routes: Routes = [
  {
    path: '', component: AdminComponent, children: [
      {path: '', pathMatch: 'full', redirectTo: 'dash'},
      {path: 'dash', component: DashComponent},
      {path: 'page/:page',component: PageComponent},
      {path: 'table/:page', component: TableComponent},
      {path: 'form/:page', component: FormComponent},
      {path: 'info/:page', component: InfoComponent},
      //{path: 'chart/:page', component: TableComponent},
      {path: 'setting/:module', component: SettingComponent},
    ]
  },
];
