import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { AlertService } from '../../services/alert.service';
import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';

import { User } from '../../models/user';
import { Auction, Bid } from '../../models/auction';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

	// users: User[] = [];
	currentUser: User;
	// allAuctions: Auction[] = [];
	auctions: Auction[] = [];
	bids: Bid[] = [];
	loading:boolean = false;

	constructor(
		private route: ActivatedRoute,
		private dataService: DataService,
		private router: Router,
		private alertService: AlertService) {

		this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
	}

	ngOnInit() {
		this.dataService.getUserAuctions(this.currentUser._id).pipe(first()).subscribe(auctions => {
			this.auctions = auctions;
			this.dataService.getUserBids(this.currentUser._id).pipe(first()).subscribe(bids => {
				this.bids = bids;
				for(let i = 0; i < this.bids.length; i++) {
					this.dataService.getAuction(this.bids[i].auction_id).pipe(first()).subscribe(auction => {
						this.bids[i].name = auction.name;
						this.bids[i].current = auction.currently;
						this.bids[i].ends = auction.ends;					
					});
				}
				this.loading = true;
			});
		});
	}

	onNameClick(id: string) {
		if (id)
			this.router.navigate(['/auction', id]);
	}
}
