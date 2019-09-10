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
	loading: boolean = false;

	constructor(
		private authenticationService: AuthenticationService,
		private dataService: DataService,
		private router: Router,
		@Inject(PLATFORM_ID) private platformId: Object,
		@Inject(APP_ID) private appId: string) {
		
	}
	
	ngOnInit() {
		this.authenticationService.currentUser.subscribe(x => {
			this.currentUser = x;
			this.loading = true;
		});
		this.authenticationService.notifications = 0;
		if (this.currentUser) {
			this.dataService.getNotifications(this.currentUser._id).subscribe(notifications => {
				this.authenticationService.notifications = notifications;
			});
		}
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
