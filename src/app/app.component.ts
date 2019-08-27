import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { PLATFORM_ID, APP_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { AuthenticationService } from './services/authentication.service';
import { User } from './models/user';
// import { LoginComponent } from './components/login/login.component';
declare var ol: any;
export var oll :any = ol;

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})

export class AppComponent {

	currentUser: User;
	map: any;

	constructor(
		private authenticationService: AuthenticationService,
		private router: Router,
		@Inject(PLATFORM_ID) private platformId: Object,
		@Inject(APP_ID) private appId: string) {
		
	}
	
	ngOnInit() {
		this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
		this.map = new ol.Map({
			target: 'map',
			layers: [
				new ol.layer.Tile({
					source: new ol.source.OSM()
				})
			],
			view: new ol.View({
				center: ol.proj.fromLonLat([23.6682993, 37.9908164]),
				zoom: 8
			})
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
					// window.scrollTo(0, pos - 20); // how far to scroll on each step
					window.scrollTo(0, 0); // how far to scroll on each step
				} else {
					window.clearInterval(scrollToTop);
				}
		 	}, 16);
		}
	}
}
