import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TableComponent } from './table/table.component';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './services/auth/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'table',
    component: TableComponent,
    canActivate: [authGuard],
    data: {
      matrice: 1
    },
  },
  {
    path: 'table2',
    component: TableComponent,
    canActivate: [authGuard],
    data: {
      matrice: 2
    },
  },
  {
    path: '',
    redirectTo: '/table',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
