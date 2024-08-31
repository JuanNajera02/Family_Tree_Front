import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { TreeComponent } from './components/tree/tree.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent},
  {path: 'TreeComponent/:id', component: TreeComponent}
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
