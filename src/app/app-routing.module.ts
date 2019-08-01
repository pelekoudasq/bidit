import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AdminComponent } from './components/admin/admin.component';
import { AuctionComponent } from './components/auction/auction.component';
import { NewAuctionComponent } from './components/newauction/newauction.component';
import { AuthGuard, AuthGuardAdmin } from './guards/auth.guard';

const routes: Routes = [
	{ path: '', component: HomeComponent/*, canActivate: [AuthGuard]*/ },
	{ path: 'login', component: LoginComponent },
	{ path: 'register', component: RegisterComponent },
	{ path: 'admin', component: AdminComponent, canActivate: [AuthGuardAdmin] },
	{ path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
	{ path: 'newauction', component: NewAuctionComponent, canActivate: [AuthGuard] },
	{ path: 'auction/:id', component: AuctionComponent },
	{ path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
