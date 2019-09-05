import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';
import { DomSanitizer } from '@angular/platform-browser';

import { User } from '../../models/user';
import { Auction } from '../../models/auction';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	users: User[] = [];
	currentUser: User;
	loggedin: boolean;
	auctions: Auction[] = [];
	loading: boolean = false;

	constructor(
		private dataService: DataService,
		private router: Router,
		private authenticationService: AuthenticationService,
		private sanitizer: DomSanitizer)
	{
		this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
	}

	transform(i: number) {
		return this.sanitizer.bypassSecurityTrustResourceUrl(this.auctions[i].photos[0].url);
	}

	ngOnInit() {
		this.dataService.getAuctions().pipe(first()).subscribe(auctions => {
			for (var i = auctions.length - 1; i >= 0; i--) {
				if (auctions[i].started) 
					this.auctions.push(auctions[i]);
			}
			this.loading = true;
		});
	}

	onNameClick(id: string) {
		if (id)
			this.router.navigate(['/auction', id]);
	}

	onCatClick(cat: string) {
		if (cat) {
			console.log(cat);
			this.authenticationService.category = cat;
			localStorage.setItem('category', cat);
			this.router.navigate(['/searchcat']);
		}	
	}
}
