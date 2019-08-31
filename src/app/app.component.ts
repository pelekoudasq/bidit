import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { PLATFORM_ID, APP_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { DataService } from './services/data.service';
import { AuthenticationService } from './services/authentication.service';
import { User } from './models/user';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})

export class AppComponent {

	currentUser: User;

	constructor(
		private authenticationService: AuthenticationService,
		private dataService: DataService,
		private router: Router,
		@Inject(PLATFORM_ID) private platformId: Object,
		@Inject(APP_ID) private appId: string) {
		
	}
	
	ngOnInit() {
		this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
		this.authenticationService.notifications = 0;
		this.dataService.getUserMessages(this.currentUser._id).subscribe(chats => {
			for (var i = chats.length - 1; i >= 0; i--) {
				if (chats[i].notify == this.currentUser._id)
					this.authenticationService.notifications++;
			}
		});
	}

	get isAdmin() {
		return this.currentUser && this.currentUser.admin;
	}

	logout() {
		this.authenticationService.logout();
		this.router.navigate(['/login']);
	}

	onActivate(event: any) {
		if (isPlatformBrowser(this.platformId)) {
		  	let scrollToTop = window.setInterval(() => {
				let pos = window.pageYOffset;
				if (pos > 0) {
					window.scrollTo(0, 0); // how far to scroll on each step
				} else {
					window.clearInterval(scrollToTop);
				}
		 	}, 16);
		}
	}
}
