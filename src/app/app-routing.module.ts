import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AdminComponent } from './components/admin/admin.component';
import { AuctionComponent } from './components/auction/auction.component';
import { NewAuctionComponent } from './components/newauction/newauction.component';
import { MessagingComponent } from './components/messaging/messaging.component';
import { ChatComponent } from './components/chat/chat.component';
import { SearchComponent } from './components/search/search.component';
import { SendMessageComponent } from './components/sendmessage/sendmessage.component';
import { AuthGuard, AuthGuardAdmin } from './guards/auth.guard';

const routes: Routes = [

	{ path: '', component: HomeComponent/*, canActivate: [AuthGuard]*/ },
	{ path: 'login', component: LoginComponent },
	{ path: 'register', component: RegisterComponent },
	{ path: 'admin', component: AdminComponent, canActivate: [AuthGuardAdmin] },
	{ path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
	{ path: 'newauction', component: NewAuctionComponent, canActivate: [AuthGuard] },
	{ path: 'auction/:id', component: AuctionComponent },
	{ path: 'messaging', component: MessagingComponent, canActivate: [AuthGuard] },
	{ path: 'chat/:id', component: ChatComponent, canActivate: [AuthGuard] },
	{ path: 'message/:id', component: SendMessageComponent, canActivate: [AuthGuard] },
	{ path: 'search', component: SearchComponent },	
	{ path: '**', redirectTo: '' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes,{scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
