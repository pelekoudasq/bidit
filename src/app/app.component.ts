import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthenticationService } from './services/authentication.service';
import { User } from '../models/user';
// import { LoginComponent } from './components/login/login.component';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})

export class AppComponent {

	currentUser: User;

	constructor(
		private authenticationService: AuthenticationService,
		private router: Router,) {
		
	}
	
	ngOnInit() {
		this.authenticationService.currentUser.subscribe(x => this.currentUser = x);		
	}

	get isAdmin() {
		return this.currentUser && this.currentUser.admin;
	}

	logout() {
		this.authenticationService.logout();
		this.router.navigate(['/login']);
	}
}
