import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './jwt-interceptor';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AlertComponent } from './guards/alert.component';
import { ModalComponent } from './guards/modal.component';
import { AuthGuard, AuthGuardAdmin } from './guards/auth.guard';
import { AlertService } from './services/alert.service';
import { ModalService } from './services/modal.service';
import { DataService } from './services/data.service';
import { AuthenticationService } from './services/authentication.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { AdminComponent } from './components/admin/admin.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AuctionComponent } from './components/auction/auction.component';
import { NewAuctionComponent } from './components/newauction/newauction.component';
import { EditProfileComponent } from './components/editprofile/editprofile.component';
import { EditAuctionComponent } from './components/editauction/editauction.component';
import { SearchCatComponent } from './components/searchcat/searchcat.component';
import { MessagingComponent } from './components/messaging/messaging.component';
import { ChatComponent } from './components/chat/chat.component';
import { SendMessageComponent } from './components/sendmessage/sendmessage.component';

@NgModule({
  declarations: [
    AppComponent,
    AlertComponent,
    ModalComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    AdminComponent,
    ProfileComponent,
    AuctionComponent,
    NewAuctionComponent,
    EditProfileComponent,
    EditAuctionComponent,
    SearchCatComponent,
    MessagingComponent,
    ChatComponent,
    SendMessageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MatSelectModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    DatePipe,
    AuthGuard,
    AuthGuardAdmin,
    AlertService,
    ModalService,
    DataService,
    AuthenticationService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
