import {Routes} from '@angular/router';
import {SettingComponent} from '../pages/setting/setting.component';
import {AdminComponent} from './admin.component';
import {DashComponent} from '../pages/dash/dash.component';


export const routes: Routes = [
  {
    path: '', component: AdminComponent, children: [
      {path: '', pathMatch: 'full', redirectTo: 'dash'},
      {path: 'dash', component: DashComponent},
      {path: 'setting/:item', component: SettingComponent},
    ]
  },
];
