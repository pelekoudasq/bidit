import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthenticationService } from './services/authentication.service';

import { User } from '../models/user';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})

export class AppComponent {

	currentUser: User;
	// loggedin: boolean;

	constructor(
		private authenticationService: AuthenticationService,
		private router: Router) {
		this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
		// this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
		// if (this.currentUser){
		// 	this.loggedin = true;
		// 	console.log("yep");
		// }
		// else{
		// 	this.loggedin = false;
		// 	console.log("nope");
		// }
	}

	get isAdmin() {
		return this.currentUser && this.currentUser.admin;
	}

	logout() {
		this.authenticationService.logout();
		this.router.navigate(['/login']);
	}
}
