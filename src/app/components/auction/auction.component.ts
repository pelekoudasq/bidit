import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';

import { User } from '../../models/user';
import { Auction, Bid } from '../../models/auction';

@Component({
	selector: 'app-auction',
	templateUrl: './auction.component.html',
	styleUrls: ['./auction.component.css']
})
export class AuctionComponent implements OnInit {

	requestedAuction: string;
	auction: Auction;
	bids: Bid[] = [];
	currentUser: User;
	loading: boolean = false;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private dataService: DataService) {

		this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
	}

	ngOnInit() {
		this.requestedAuction = this.route.snapshot.params.id;
		this.dataService.getAuction(this.requestedAuction).pipe(first()).subscribe(auction => {
			this.auction = auction;
			for (var i = 0; i < this.auction.bids.length; i++) {
				this.dataService.getBid(this.auction.bids[i]).pipe(first()).subscribe(bid => {
					this.bids.push(bid);
				});
			}
			this.loading = true;
		});
	}

}
