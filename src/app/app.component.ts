import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthenticationService } from './services/authentication.service';

import { User } from '../models/user';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

	currentUser: User;
	// loggedin: boolean;

	constructor(
		private authenticationService: AuthenticationService,
		private router: Router) {
		this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
		this.router.navigateByUrl('/home', {skipLocationChange: true}).then(()=>
		this.router.navigate([""])); 
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

	ngOnInit() {

	}

	logout() {
        this.authenticationService.logout();
        this.router.navigate(['/login']);
    }
}
