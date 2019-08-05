import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { AuthenticationService } from '../../services/authentication.service';
import { DataService } from '../../services/data.service';
import { DomSanitizer } from '@angular/platform-browser';

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
	seller: User;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private dataService: DataService,
		private authenticationService: AuthenticationService,
		private sanitizer: DomSanitizer)
	{
		this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
	}

	transform() {
		return this.sanitizer.bypassSecurityTrustResourceUrl(this.auction.image);
	}

	ngOnInit() {
		this.requestedAuction = this.route.snapshot.params.id;
		this.dataService.getAuction(this.requestedAuction).pipe(first()).subscribe(auction => {
			this.auction = auction;
			this.dataService.getById(auction.seller_id).pipe(first()).subscribe(user => {
				this.seller = user;
				for (var i = 0; i < this.auction.bids.length; i++) {
					this.dataService.getBid(this.auction.bids[i]).pipe(first()).subscribe(bid => {
						this.bids.push(bid);
					});
				}
				this.loading = true;
				if (!this.auction.started) {
					if (!this.currentUser || this.auction.seller_id != this.currentUser._id)
						this.router.navigate(['/']);
				}
			});
		});
	}

}
