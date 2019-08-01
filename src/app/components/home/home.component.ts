import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';

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

	constructor(
		private dataService: DataService,
		private router: Router,
		private authenticationService: AuthenticationService) {
		this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
	
	}

	ngOnInit() {
		this.dataService.getAuctions().pipe(first()).subscribe(auctions => {
			this.auctions = auctions;
		});
	}

	onNameClick(id: string) {
		if (id)
			this.router.navigate(['/auction', id]);
	}
}
